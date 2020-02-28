const ReactDOM = require('react-dom');
const Render=require('treemindmap').Render;
const axios = require('axios');
const CONST_EDITOR_DIALOG = "treemindmap-editor";
const CONST_EDITOR_DIALOG_BODY = "treemindmap-editor-body";

export function RenderReadOnly(url, domid)
{
    let element = document.getElementById(domid);
    element.innerHTML="Generating a Mind Map... :)";

    axios.get(url)
        .then(response => {
            try{
                element.innerHTML="";
                let readonly_data = response.data;
                if(typeof readonly_data === "string")
                {
                    readonly_data = JSON.parse(readonly_data);
                }
                readonly_data.property.isReadOnly=2;
                readonly_data = JSON.stringify(readonly_data);


                let promise = new Promise((resolve, reject) => { // #1
                    Render(readonly_data, (state)=>{
                        return state
                    }, domid, ReactDOM);
                    resolve();
                });

                promise.then(()=>{
                    //Resize the height
                    $(function() {
                        let windowHeight = $("#" + domid).find('.MainWindow-Content').height();
                        $("#" + domid).height(windowHeight);
                    })
                })


            } catch(e)
            {
                let element = document.getElementById(domid);
                element.innerHTML="Failed to render the Mind Map... ;( \n" + e.message;
                console.error("Failed to render the Mind Map: " + e.message)
            }
        })
}

function RemoveEditorDialog() {
    let dialog = document.getElementById(CONST_EDITOR_DIALOG);
    if(dialog!=null)
    {
        dialog.remove();
    }
}


function RenderEditorDialog()
{
    RemoveEditorDialog();
    let target = document.getElementById('toolbar');

    let section = document.createElement('section');
    section.id=CONST_EDITOR_DIALOG;
    section.className="aui-dialog2 aui-dialog2-medium";
    section.style.position="absolute";
    section.style.width="100%";
    section.style.height="100%";
    section.style.zIndex=100;

    let header = document.createElement('div');
    header.className="aui-dialog2-header";

    let header_h2 = document.createElement('h2');
    header_h2.className = "aui-dialog2-header-main";
    header_h2.innerText = "Tree Mind Map Editor";

    let closebutton = document.createElement('a');
    closebutton.className="aui-dialog2-header-close";

    let closebutton_span = document.createElement('span');
    closebutton_span.className="aui-icon aui-icon-small aui-iconfont-close-dialog";
    closebutton_span.innerText="Close";
    closebutton.appendChild(closebutton_span);


    header.appendChild(header_h2);
    header.appendChild(closebutton);


    let div = document.createElement('div');
    div.id=CONST_EDITOR_DIALOG_BODY;
    div.className="aui-dialog2-content";
    div.style.height="available";
    div.style.maxHeight="100%";
    div.innerHTML="Generating a Mind Map Editor... :)";

    let footer = document.createElement('footer');
    footer.className="aui-dialog2-footer";

    let submit_button_div = document.createElement('div');
    submit_button_div.className="aui-dialog2-footer-actions";
    submit_button_div.style.alignContent="right";

    let submit_button = document.createElement('button');
    submit_button.className="aui-button aui-button-primary";
    submit_button.innerText="Submit";
    submit_button_div.appendChild(submit_button);
    footer.appendChild(submit_button_div);



    target.appendChild(section);
    section.appendChild(header);
    section.appendChild(div);
    section.appendChild(footer);

}


export function RenderEditor(initial_data, callback)
{

    let promise = new Promise((resolve, reject) => {
        RenderEditorDialog();
        resolve();
    });

    promise.then(()=>{
        Render(initial_data, (state) => {callback(state)}, CONST_EDITOR_DIALOG_BODY, ReactDOM);
    })
    .then(()=>{
        AJS.dialog2("#demo-dialog").show();
    })
}



