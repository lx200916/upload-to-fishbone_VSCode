import { Uri, ViewColumn, Webview, window } from "vscode";
// eslint-disable-next-line @typescript-eslint/semi
export function getUri(
  webview: Webview,
  extensionUri: Uri,
  pathList: string[]
) {
  return webview.asWebviewUri(Uri.joinPath(extensionUri, ...pathList));
}
export enum PasteType {
  private = "🔏",
  public = "🔗",
}
type PasteInfo = {
  content: string;
  language: string;
  type: PasteType;
};
export function render(extensionUri: Uri, infos: PasteInfo) {
  const panel = window.createWebviewPanel(
    "fishboneWebview",
    "Upload To Fishbone",
    ViewColumn.Two,
    {
      enableScripts: true,
    }
  );
  panel.webview.html = getHtmlForWebview(panel.webview, extensionUri, infos);
}

function StringAs(string: string) {
  return '"' + string.replace(/(\\|\"|\n|\r|\t)/g, "\\$1") + '"';
}
function getHtmlForWebview(
  webview: Webview,
  extensionUri: Uri,
  infos: PasteInfo
): string {
  const toolkitUri = getUri(webview, extensionUri, [
    "node_modules",
    "@vscode",
    "webview-ui-toolkit",
    "dist",
    "toolkit.js",
  ]);
  const contentUri = getUri(webview, extensionUri, ["src", "panel", "main.js"]);
  const eyeIcon = `
        <svg width="16" height="16" viewBox="0 0 16 16"  id="eye-closed"  style="display:none" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M1 9.50073C1 5.60073 4.1 2.50073 8 2.50073C11.9 2.50073 15 5.60073 15 9.50073H14C14 6.20073 11.3 3.50073 8 3.50073C4.7 3.50073 2 6.20073 2 9.50073H1ZM5 9.50073C5 7.80073 6.3 6.50073 8 6.50073C9.7 6.50073 11 7.80073 11 9.50073C11 11.2007 9.7 12.5007 8 12.5007C6.3 12.5007 5 11.2007 5 9.50073ZM6 9.50073C6 10.6007 6.9 11.5007 8 11.5007C9.1 11.5007 10 10.6007 10 9.50073C10 8.40073 9.1 7.50073 8 7.50073C6.9 7.50073 6 8.40073 6 9.50073Z"/></svg>
        <svg width="16" height="16" viewBox="0 0 16 16" id="eye-open" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M8 2.50073C6.5 2.50073 5.2 2.90073 4.1 3.70073L4.9 4.40073C5.8 3.80073 6.8 3.50073 8 3.50073C11.3 3.50073 14 6.20073 14 9.50073H15C15 5.60073 11.9 2.50073 8 2.50073ZM1 3.50078L2.6 5.00078C1.6 6.20078 1 7.80078 1 9.50078H2C2 8.00078 2.5 6.70078 3.4 5.70078L5.6 7.70078C5.2 8.20078 5 8.80078 5 9.50078C5 11.2008 6.3 12.5008 8 12.5008C8.8 12.5008 9.5 12.2008 10 11.7008L13 14.5008L13.7 13.8008L1.7 2.80078L1 3.50078ZM6.3 8.40078L9.2 11.1008C8.9 11.3008 8.5 11.5008 8 11.5008C6.9 11.5008 6 10.6008 6 9.50078C6 9.10078 6.1 8.70078 6.3 8.40078ZM11 10.0007L10 9.10073C9.8 8.30073 9.1 7.60073 8.2 7.50073L7.2 6.60073C7.5 6.50073 7.7 6.50073 8 6.50073C9.7 6.50073 11 7.80073 11 9.50073V10.0007Z"/></svg>
        `;
  const refreshIcon = `<svg width="16" id="refreshToken"  slot="end" height="16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path fill-rule="evenodd" clip-rule="evenodd" d="M4.681 3H2V2h3.5l.5.5V6H5V4a5 5 0 1 0 4.53-.761l.302-.954A6 6 0 1 1 4.681 3z"/></svg>`;
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
      .block {

      }
      .block >p{
line-height:1.4em!important;
font-weight:600;
font-size:16px;
margin:0;

      }
      .block >*:last-child{
        margin:9px 0;
      }
      </style>
    <title>Upload To FishBone</title>
    </head>
    <body>
    <p style="font-size:26px;font-weight:bold;">Upload To FishBone <vscode-badge id="tag">${
      infos.type
    }</vscode-badge>
    </p>
    <span>
    <vscode-tag ><span id="pastetype">${
      infos.type === PasteType.private ? "Private" : "Public"
    }</span></vscode-tag>
    <vscode-tag ><span id="pastelang">${infos.language}</span></vscode-tag>
    <vscode-tag id="hasDelete" style="display:none"> 🔥 </vscode-tag>

    </span>
    <vscode-divider style="margin-bottom:10px"></vscode-divider>
    <div class="block">
    <p>Paste Password<subtitle>  :</subtitle></p>
    <div id="password-wrapper">
    <vscode-text-field type="password" size="25" id="password" placeholder="Input Password to Encrypt">
    <div slot="end">
    ${eyeIcon}
    </div>

    </vscode-text-field>

    </div>
    </div>
    <div class="block">
    <p>Paste Language<subtitle>  :</subtitle></p>


    <vscode-dropdown id="lang">
    <vscode-option>${infos.language}</vscode-option>
    <vscode-option>Auto</vscode-option>
    <vscode-option>Go</vscode-option>
  </vscode-dropdown>
  
  </div>

  <div class="block">
  <p>Paste Lifetime<subtitle>  :</subtitle></p>

  <vscode-dropdown>
  <vscode-option>Once</vscode-option>
  <vscode-option>OneDay</vscode-option>
  <vscode-option>OneWeek</vscode-option>

</vscode-dropdown>

</div>
<div class="block">
<p><vscode-checkbox id="hasDeleteToken">🔥 Generate DeleteToken</vscode-checkbox></p>
<vscode-text-field style="display:none" type="text" size="25" id="deletetoken" placeholder="Delete Token">
${refreshIcon}
</vscode-text-field> 

</div>
    <vscode-divider style="margin-bottom:10px"></vscode-divider>
    <div class="block">
    <p>Paste Content<subtitle>  :</subtitle></p>
    <vscode-text-area id="content" label="Paste Content" rows="15" style="width:88%" ></vscode-text-area>
    </div>
    <script>
const content=document.getElementById('content');
content.setAttribute('current-value',JSON.parse(${StringAs(
    JSON.stringify({ c: infos.content })
  )}).c);
const password=document.getElementById('password');
const eyeOpen=document.getElementById('eye-open');
const eyeClose=document.getElementById('eye-closed');
const lang=document.getElementById('lang');
const pasteType=document.getElementById('pastetype');
const tag=document.getElementById('tag');
password.addEventListener('change',(e)=>{
if(e.target.value.length>0){
  pasteType.innerText='Private';
  tag.innerText='🔏';
}else{
  pasteType.innerText='Public';
  tag.innerText='🔗';
}

})
const pastelang=document.getElementById('pastelang');
lang.addEventListener('change',(e)=>{
  pastelang.textContent=e.target.value.trim();})

eyeOpen.addEventListener('click',()=>{
  password.setAttribute('type','text');
  eyeOpen.style.display='none';
  eyeClose.style.display='inline';
});
eyeClose.addEventListener('click',()=>{
  password.setAttribute('type','password');
  eyeOpen.style.display='inline';
  eyeClose.style.display='none';
});
const hasDeleteToken=document.getElementById('hasDeleteToken');
const deletetoken=document.getElementById('deletetoken');
const hasDelete=document.getElementById('hasDelete');
hasDeleteToken.addEventListener('change',(e)=>{
  if(e.target.checked){deletetoken.style.display='inline-block';
  hasDelete.style.display='inline-block';

}else{
deletetoken.style.display='none';
hasDelete.style.display='none';
  }

});
    </script>
    </body>
      `;
}
