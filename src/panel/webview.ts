import { Uri, ViewColumn, Webview, window } from "vscode";
// eslint-disable-next-line @typescript-eslint/semi
export function getUri(webview: Webview, extensionUri: Uri, pathList: string[]) {
    return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
  }
export enum PasteType{
    private="🔏",
    public="🔗"
}
type PasteInfo ={
    content: string,
    language: string,
    type: PasteType,

};
  export function render(extensionUri: Uri,infos:PasteInfo){
      const panel =window.createWebviewPanel(
        "fishboneWebview",
        "Upload To Fishbone",
        ViewColumn.Two,{
            enableScripts: true,
        });
        panel.webview.html = getHtmlForWebview(panel.webview,extensionUri,infos);

  }
  

  function StringAs(string: string) {
    return '"' + string.replace(/(\\|\"|\n|\r|\t)/g, "\\$1") + '"';
  }
function getHtmlForWebview(webview:Webview,extensionUri: Uri, infos: PasteInfo): string {
     const toolkitUri = getUri(webview, extensionUri, [
        "node_modules",
        "@vscode",
        "webview-ui-toolkit",
        "dist",
        "toolkit.js",
      ]);
      const contentUri = getUri(webview, extensionUri, [
        "src",
        "panel",
        "main.js",
        ]);
        
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script type="module" src="${toolkitUri}"></script>
      <script type="module" src="${contentUri}"></script>
      <style type="text/css">
      p{
        margin:8px 0;
      }
      subtitle{
        opacity:0.5;
      }
      </style>
    <title>Upload To FishBone</title>
    </head>
    <body>
    <p style="font-size:26px;font-weight:bold;">Upload To FishBone <vscode-badge>${infos.type}</vscode-badge>
    </p>
    <span>
    <vscode-tag id="paste.type">${infos.type===PasteType.private?'Private':'Public'}</vscode-tag>
    <vscode-tag id="paste.lang">${infos.language}</vscode-tag>

    </span>
    
    <p><strong>Paste Content<subtitle>  :</subtitle></strong></p>
    <vscode-text-area id="content" label="Paste Content" rows="15" style="width:88%" ></vscode-text-area>
    <script>
const content=document.getElementById('content');
content.setAttribute('current-value',JSON.parse(${StringAs(JSON.stringify({"c":infos.content}))}).c);
    </script>
    </body>
      `;

}
