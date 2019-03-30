@echo off
echo Below is the branch you can checkout:(if not appear,it means someone edit it in some files)
git branch
set /p var=Please Enter New_BRANCH_Name:
echo %var%
choice /C:YN /M:"Are you sure?"
if errorlevel 3 goto end 
if errorlevel 2 goto No 
if errorlevel 1 goto Yes

:Yes
git checkout -b %var%
GOTO end

:No 
echo Nothing happened!
GOTO end

:next
echo next
GOTO end

:end
echo byebye!

pause