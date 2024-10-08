@echo off

rem Loop through version tags from 1.0.6 to 1.0.2
for /l %%i in (5, -1, 1) do (
  set "tag=@stingerloom/bootstrap@1.0.%%i"

  rem Delete local tag
  git tag -d %tag%

  rem Delete remote tag
  git push origin --delete @stingerloom/bootstrap@1.0.%%i
)