@echo off
echo Below is the branch you can checkout:(if not appear,it means someone edit it in some files)
git branch
set /p var=Please Enter BRANCH:
echo %var%
git checkout %var%