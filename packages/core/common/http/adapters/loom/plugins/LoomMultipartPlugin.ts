/* eslint-disable @typescript-eslint/no-explicit-any */
import { ServerPlugin } from "../../../interfaces";
import { LoomServer } from "../server/LoomServer";
import * as http from "http";

/**
 * Loom 서버용 멀티파트 폼 데이터 처리 플러그인
 *
 * HTTP 멀티파트 메시지 예시 1 - 프로필 이미지 업로드:
 *
 * POST /api/profile/upload HTTP/1.1
 * Host: api.example.com
 * Content-Type: multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW
 * Content-Length: 1024
 *
 * ------WebKitFormBoundary7MA4YWxkTrZu0gW
 * Content-Disposition: form-data; name="userId"
 *
 * 12345
 * ------WebKitFormBoundary7MA4YWxkTrZu0gW
 * Content-Disposition: form-data; name="profileImage"; filename="avatar.jpg"
 * Content-Type: image/jpeg
 *
 * �������JFIF��C��C��������������������}!1AQa"q2���#B��R��$3br�
 * [... binary JPEG data ...]
 * ------WebKitFormBoundary7MA4YWxkTrZu0gW--
 *
 * HTTP 멀티파트 메시지 예시 2 - 회원가입 폼:
 *
 * POST /api/auth/register HTTP/1.1
 * Host: api.example.com
 * Content-Type: multipart/form-data; boundary=----FormData7MA4YWxkTrZu0gW
 * Content-Length: 2048
 *
 * ------FormData7MA4YWxkTrZu0gW
 * Content-Disposition: form-data; name="username"
 *
 * john_doe
 * ------FormData7MA4YWxkTrZu0gW
 * Content-Disposition: form-data; name="email"
 *
 * john.doe@example.com
 * ------FormData7MA4YWxkTrZu0gW
 * Content-Disposition: form-data; name="password"
 *
 * mySecurePassword123!
 * ------FormData7MA4YWxkTrZu0gW
 * Content-Disposition: form-data; name="fullName"
 *
 * John Doe
 * ------FormData7MA4YWxkTrZu0gW
 * Content-Disposition: form-data; name="profilePicture"; filename="profile.png"
 * Content-Type: image/png
 *
 * �PNG
 *
 * IHDR������������������������sRGB������������������gAMA������������������
 * [... binary PNG data ...]
 * ------FormData7MA4YWxkTrZu0gW
 * Content-Disposition: form-data; name="resume"; filename="john_resume.pdf"
 * Content-Type: application/pdf
 *
 * %PDF-1.4
 * 1 0 obj
 * <<
 * /Type /Catalog
 * /Pages 2 0 R
 * >>
 * [... binary PDF data ...]
 * ------FormData7MA4YWxkTrZu0gW--
 *
 * 멀티파트 구조 설명:
 * - boundary: 각 파트를 구분하는 고유한 경계 문자열
 * - --boundary: 각 파트의 시작 (leading dashes)
 * - --boundary--: 메시지의 끝 (trailing dashes)
 * - Content-Disposition: 필드명과 파일명 정보
 * - Content-Type: 파일의 MIME 타입 (파일 업로드시에만)
 * - 빈 줄(\r\n\r\n): 헤더와 데이터 구분
 */

/**
 * 파일 정보 인터페이스
 */
export interface ParsedFile {
  /**
   * 파일의 필드명
   */
  fieldname: string;
  /**
   * 원본 파일명
   */
  originalname: string;
  /**
   * 파일의 MIME 타입
   */
  mimetype: string;
  /**
   * 파일 크기 (바이트)
   */
  size: number;
  /**
   * 파일 데이터 (Buffer)
   */
  buffer: Buffer;
  /**
   * 파일 인코딩
   */
  encoding?: string;
}

/**
 * 멀티파트 파싱 결과
 */
export interface MultipartParseResult {
  /**
   * 텍스트 필드들
   */
  fields: Record<string, string | string[]>;
  /**
   * 파일들
   */
  files: ParsedFile[];
}

/**
 * 멀티파트 플러그인 옵션
 */
export interface MultipartOptions {
  /**
   * 최대 파일 크기 (바이트, 기본값: 10MB)
   */
  maxFileSize?: number;
  /**
   * 최대 파일 수 (기본값: 10)
   */
  maxFiles?: number;
  /**
   * 최대 필드 수 (기본값: 100)
   */
  maxFields?: number;
  /**
   * 파일 필터 함수
   */
  fileFilter?: (file: ParsedFile) => boolean;
  /**
   * 업로드 디렉토리 (파일을 디스크에 저장할 경우)
   */
  uploadDir?: string;
  /**
   * 메모리에 저장할지 여부 (기본값: true)
   */
  inMemory?: boolean;
}

/**
 * Loom 서버용 멀티파트 폼 데이터 처리 플러그인 구현체
 * multipart/form-data Content-Type의 요청을 파싱하여 파일과 필드를 추출합니다.
 */
export class LoomMultipartPlugin implements ServerPlugin {
  public readonly name = "loom-multipart";
  private options: Required<MultipartOptions>;

  constructor(options: MultipartOptions = {}) {
    this.options = {
      maxFileSize: options.maxFileSize ?? 10 * 1024 * 1024, // 10MB
      maxFiles: options.maxFiles ?? 10,
      maxFields: options.maxFields ?? 100,
      fileFilter: options.fileFilter ?? (() => true),
      uploadDir: options.uploadDir ?? "/tmp",
      inMemory: options.inMemory ?? true,
    };
  }

  install(server: LoomServer): void {
    // 멀티파트 처리 미들웨어 추가
    server.use((req: http.IncomingMessage, res: http.ServerResponse, next) => {
      const contentType = req.headers["content-type"];

      // multipart/form-data가 아닌 경우 다음 미들웨어로
      if (!contentType || !contentType.includes("multipart/form-data")) {
        next();
        return;
      }

      try {
        this.parseMultipartData(req)
          .then((result) => {
            // 파싱 결과를 req 객체에 추가
            (req as any).multipart = result;
            (req as any).body = { ...result.fields };
            (req as any).files = result.files;
            next();
          })
          .catch((error) => {
            console.error(
              `[${this.name}] Error parsing multipart data:`,
              error,
            );
            res.statusCode = 400;
            res.setHeader("Content-Type", "application/json");
            res.end(
              JSON.stringify({
                error: "Bad Request",
                message: "Failed to parse multipart data",
                details: error.message,
              }),
            );
          });
      } catch (error) {
        console.error(
          `[${this.name}] Error handling multipart request:`,
          error,
        );
        next();
      }
    });

    console.log(`[${this.name}] Multipart plugin installed successfully`);
  }

  /**
   * 멀티파트 데이터를 파싱합니다.
   */
  private parseMultipartData(
    req: http.IncomingMessage,
  ): Promise<MultipartParseResult> {
    return new Promise((resolve, reject) => {
      const contentType = req.headers["content-type"];
      if (!contentType) {
        reject(new Error("Content-Type header is missing"));
        return;
      }

      // boundary 추출
      const boundaryMatch = contentType.match(/boundary=(.+)$/);
      if (!boundaryMatch) {
        reject(new Error("Boundary not found in Content-Type"));
        return;
      }

      const boundary = `--${boundaryMatch[1]}`;
      const chunks: Buffer[] = [];
      let totalSize = 0;

      const timeout = setTimeout(() => {
        reject(new Error("Multipart parsing timeout"));
      }, 30000);

      req.on("data", (chunk: Buffer) => {
        totalSize += chunk.length;

        // 전체 요청 크기 체크
        if (totalSize > this.options.maxFileSize * this.options.maxFiles) {
          clearTimeout(timeout);
          reject(new Error("Request entity too large"));
          return;
        }

        chunks.push(chunk);
      });

      req.on("end", () => {
        clearTimeout(timeout);

        try {
          const buffer = Buffer.concat(chunks);
          const result = this.parseBoundaryData(buffer, boundary);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      req.on("error", (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  /**
   * 바운더리 데이터를 파싱합니다.
   */
  private parseBoundaryData(
    buffer: Buffer,
    boundary: string,
  ): MultipartParseResult {
    const fields: Record<string, string | string[]> = {};
    const files: ParsedFile[] = [];

    // 바운더리로 분할
    const boundaryBuffer = Buffer.from(boundary);
    const parts: Buffer[] = [];
    let start = 0;

    while (start < buffer.length) {
      const boundaryIndex = buffer.indexOf(boundaryBuffer, start);
      if (boundaryIndex === -1) break;

      if (start !== boundaryIndex) {
        parts.push(buffer.subarray(start, boundaryIndex));
      }
      start = boundaryIndex + boundaryBuffer.length;
    }

    // 각 파트 처리
    for (const part of parts) {
      if (part.length < 4) continue; // 최소 크기 체크

      const result = this.parsePart(part);
      if (result) {
        if (result.type === "field") {
          const { name, value } = result;
          if (fields[name]) {
            // 같은 이름의 필드가 여러 개인 경우 배열로 처리
            if (Array.isArray(fields[name])) {
              (fields[name] as string[]).push(value);
            } else {
              fields[name] = [fields[name] as string, value];
            }
          } else {
            fields[name] = value;
          }
        } else if (result.type === "file") {
          const file = result.file;

          // 파일 크기 체크
          if (file.size > this.options.maxFileSize) {
            throw new Error(`File ${file.originalname} exceeds maximum size`);
          }

          // 파일 필터 적용
          if (!this.options.fileFilter(file)) {
            continue;
          }

          // 최대 파일 수 체크
          if (files.length >= this.options.maxFiles) {
            throw new Error("Maximum number of files exceeded");
          }

          files.push(file);
        }
      }
    }

    // 최대 필드 수 체크
    if (Object.keys(fields).length > this.options.maxFields) {
      throw new Error("Maximum number of fields exceeded");
    }

    return { fields, files };
  }

  /**
   * 개별 파트를 파싱합니다.
   */
  private parsePart(
    part: Buffer,
  ):
    | { type: "field"; name: string; value: string }
    | { type: "file"; file: ParsedFile }
    | null {
    // 헤더와 본문 분리
    const headerEndIndex = part.indexOf(Buffer.from("\r\n\r\n"));
    if (headerEndIndex === -1) return null;

    const headerBuffer = part.subarray(0, headerEndIndex);
    const bodyBuffer = part.subarray(headerEndIndex + 4);

    const headers = headerBuffer.toString("utf8");
    const dispositionMatch = headers.match(
      /Content-Disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]*)")?/i,
    );

    if (!dispositionMatch) return null;

    const fieldName = dispositionMatch[1];
    const filename = dispositionMatch[2];

    if (filename !== undefined) {
      // 파일 처리
      const contentTypeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);
      const mimetype = contentTypeMatch
        ? contentTypeMatch[1].trim()
        : "application/octet-stream";

      const file: ParsedFile = {
        fieldname: fieldName,
        originalname: filename,
        mimetype,
        size: bodyBuffer.length,
        buffer: bodyBuffer,
        encoding: "binary",
      };

      return { type: "file", file };
    } else {
      // 필드 처리
      const value = bodyBuffer.toString("utf8").replace(/\r\n$/, "");
      return { type: "field", name: fieldName, value };
    }
  }

  /**
   * 플러그인 옵션을 반환합니다.
   */
  public getOptions(): MultipartOptions {
    return { ...this.options };
  }

  /**
   * 파일을 디스크에 저장합니다 (선택적 기능).
   */
  public async saveFileToDisk(
    file: ParsedFile,
    customPath?: string,
  ): Promise<string> {
    const fs = await import("fs");
    const path = await import("path");

    const uploadDir = customPath || this.options.uploadDir;
    const filename = `${Date.now()}-${file.originalname}`;
    const filepath = path.join(uploadDir, filename);

    // 디렉토리 생성
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 파일 저장
    fs.writeFileSync(filepath, file.buffer);

    return filepath;
  }
}
