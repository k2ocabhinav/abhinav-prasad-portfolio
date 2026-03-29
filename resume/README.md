# Resume Assets

This folder is the editable source for the portfolio resume download.

## Files

- `abhinav-resume.txt`: source template that is easy to edit
- `../public/resume/abhinav-resume.pdf`: generated file served by Next.js

## Update Flow

1. Edit `abhinav-resume.html`.
2. Regenerate the PDF:

```bash
cupsfilter -m application/pdf resume/abhinav-resume.txt > public/resume/abhinav-resume.pdf
```

3. Verify the Download Resume button still points to `/resume/abhinav-resume.pdf`.
