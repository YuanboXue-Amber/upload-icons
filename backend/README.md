# upload-icons

## Backend

Sync _microsoft/fluentui-system-icons_ to Azure AI Search:
`npm run update-icons:dev` or `npm run update-icons:prod`

Run server:
`npm run serve:dev` or `npm run serve:prod`

Sample request:

```
curl --location 'http://localhost:3000/api/search' --form 'imageUrl="<image-url>"'
```

```
curl --location 'http://localhost:3000/api/search' --form 'image=@"<image-path>"'
```
