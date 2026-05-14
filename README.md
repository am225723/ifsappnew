# ifsappnew

Target repository for the migrated IFS app.

Source branch prepared for migration:

- Source repo: `am225723/ifs-program-react-app`
- Source branch: `migration/clerk-neon-uploadthing`
- Migration PR: `am225723/ifs-program-react-app#15`

## Migration status

The full migrated branch has been prepared in the source repository. This repository is initialized as the destination for that branch.

Because the GitHub connector available in this chat can create and update individual files but does not expose a bulk branch-copy or git-push operation, the full repository tree still needs to be pushed here from a local machine or GitHub Actions.

## Local copy command

```bash
git clone https://github.com/am225723/ifs-program-react-app.git
cd ifs-program-react-app
git checkout migration/clerk-neon-uploadthing
git remote add ifsappnew https://github.com/am225723/ifsappnew.git
git push ifsappnew migration/clerk-neon-uploadthing:main --force-with-lease
```

After pushing, run:

```bash
npm install
```

to regenerate `package-lock.json` for the Clerk, Neon, and UploadThing dependency set.
