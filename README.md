# github-api-scripts

Collection of scripts for API-based cloning a large number of repositories of a github org.

## Code stats

Code stats can be generated using [cloc](https://github.com/AlDanial/cloc).

### Generate reports per repo and write to single file

Windows-based synthax:

```cmd
# from c:\parent\repos folder
for /D %I in (.\*) do cd %I && echo %I >> c:\parent\report_by_repo.txt && c:\parent\cloc --exclude-lang=JSON,XML --vcs git >> c:\parent\report_by_repo.txt && cd ..
```
