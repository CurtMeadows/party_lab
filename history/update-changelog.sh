#!/bin/bash
# Regenerates history/CHANGELOG.md from git log.
cd "$(dirname "$0")/.." || exit 1
{
echo "# Changelog"
echo
echo "Every change to the site, newest first. Generated from git history."
echo "To refresh: \`bash history/update-changelog.sh\`"
git log --format='%ad|%s' --date=short | awk -F'|' '
{ split($1,d,"-"); m=d[1]"-"d[2];
  if (m!=cur) { cmd="date -j -f %Y-%m \"" m "\" \"+%B %Y\""; cmd | getline name; close(cmd); printf "\n## %s\n\n", name; cur=m }
  printf "- **%s** — %s\n", $1, $2 }'
} > history/CHANGELOG.md
echo "Updated history/CHANGELOG.md"
