const Render=require('treemindmap').Render;
const axios = require('axios');

module.exports = class EditorDialog {
    constructor(parentdom) {
        this.CONST_EDITOR_DIALOG = "treemindmap-editor";
        this.CONST_EDITOR_DIALOG_BODY = "treemindmap-editor-body";
        this.parentdom=parentdom;
        this.filename = "treemindmap.tmm";
        this.data=[];
        this.ReactDOM = require('react-dom');
    }

    GetFileNameWithExtention()
    {
        return this.filename + ".tmm";
    }


    Render()
    {
        let promise = new Promise((resolve, reject) => {
            this.RenderEditorDialog();
            resolve();
        });

        promise.then(()=>{
            Render(null, (state) => {this.data=JSON.stringify(state)}, this.CONST_EDITOR_DIALOG_BODY, this.ReactDOM);
        })
            .then(()=>{
                AJS.dialog2("#demo-dialog").show();
            })
    }

    RemoveEditorDialog() {
        let dialog = document.getElementById(this.CONST_EDITOR_DIALOG);
        if(dialog!=null)
        {
            dialog.remove();
        }
    }

    GetHeader()
    {
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

        return header;
    }

    GetBody()
    {
        let body = document.createElement('div');
        body.className="aui-dialog2-content";
        body.style.height="100%";
        body.style.maxHeight="100%";


        let form = document.createElement('form');
        form.className = "aui";
        form.style.height="50px";

        let fieldgroup_div = document.createElement('div');
        fieldgroup_div.className="fieldgroup";

        let form_text = document.createElement('input');
        form_text.className="text";
        form_text.id="treemindmap-attachment-name";
        form_text.onchange=(e)=>{this.filename=form_text.value};

        let form_label = document.createElement('label');
        form_label.htmlFor=form_text.id;
        form_label.innerText="Attachment Name ";


        form.appendChild(fieldgroup_div);
        fieldgroup_div.appendChild(form_label);
        fieldgroup_div.appendChild(form_text);

        let div = document.createElement('div');
        div.id=this.CONST_EDITOR_DIALOG_BODY;
        div.innerHTML="Generating a Mind Map Editor... :)";

        body.appendChild(form);
        body.appendChild(div);

        return body;
    }

    GetFooter()
    {
        let footer = document.createElement('footer');
        footer.className="aui-dialog2-footer";

        let submit_button_div = document.createElement('div');
        submit_button_div.className="aui-dialog2-footer-actions";
        submit_button_div.style.alignContent="right";

        let submit_button = document.createElement('button');
        submit_button.className="aui-button aui-button-primary";
        submit_button.innerText="Save";
        submit_button_div.appendChild(submit_button);
        footer.appendChild(submit_button_div);
        submit_button.onclick=(e)=>{e.preventDefault(); this.InsertAttachment(this.filename, this.data)};

        return footer;
    }


    RenderEditorDialog()
    {
        this.RemoveEditorDialog();
        let target = document.getElementById(this.parentdom);
        let succeeding = document.getElementById(this.succeedingdom);

        let section = document.createElement('section');
        section.id=this.CONST_EDITOR_DIALOG;
        section.className="aui-dialog2 aui-dialog2-medium";
        section.style.position="absolute";
        section.style.width="100%";
        section.style.height="100%";
        section.style.zIndex=100;


        target.insertBefore(section,target.firstChild);
        section.appendChild(this.GetHeader());
        section.appendChild(this.GetBody());
        section.appendChild(this.GetFooter());

    }


    InsertAttachment(filename, data){

        if(this.filename==="")
        {
            alert("Please specify the name of this Mind Map");
        }
        else
        {
            let contentid = AJS.Meta.get('content-id');
            let baseurl = AJS.params.baseUrl;
            let endpoint = this.JoinPath([baseurl, "/rest/api/content/", contentid,"/child/attachment?allowDuplicated=true"] );
            console.log('posting to '+ endpoint);

            let file = new File([this.data], this.GetFileNameWithExtention(), {
                type: "text/plain",
            });
            let params = new FormData();
            params.append('file', file);
            axios.post(endpoint, params, {headers: {'X-Atlassian-Token': 'nocheck'}})
                .then((response)=>{
                    console.log(response);
                    this.RemoveEditorDialog()})
                .catch((error)=> {
                        endpoint = this.JoinPath([baseurl, "/rest/api/content/", contentid, "/child/attachment?status=draft&allowDuplicated=true"]);
                        axios.post(endpoint, params, {headers: {'X-Atlassian-Token': 'nocheck'}})
                            .then((response) => {
                                console.log(response);
                                this.RemoveEditorDialog()
                            })
                            .catch((error) => {
                                alert("Failed to save the mind map ;( " + error.message)
                            })
                    }
                )

        }

    }

    JoinPath(parts, sep){
        let regexp =  new RegExp('(^/|/$)','g');
        return parts
            .map(item=>item.replace(regexp,''))
            .reduce((acc,cur)=>acc+"/"+cur);
    }

}

