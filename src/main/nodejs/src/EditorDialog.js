const axios = require('axios');
const DataRenderer = require('./DataRenderer.js');
const JoinPath = require('./JoinPath.js');

module.exports = class EditorDialog {
    constructor(parentdom) {
        this.CONST_EDITOR_DIALOG = "treemindmap-editor";
        this.CONST_EDITOR_DIALOG_BODY = "treemindmap-editor-body";
        this.CONST_FORM = "treemindmap-attachment-name-form";
        this.CONST_FORM_FILENAME = "treemindmap-attachment-name";
        this.parentdom=parentdom;
        this.filename = "";
        this.data=[];
    }

    GetFileNameWithExtention()
    {
        return this.GetSpecifiedFileName() + ".tmm";
    }

    GetSpecifiedFileName()
    {
        let element = document.getElementById(this.CONST_FORM_FILENAME+ "-input");
        return element.value.replace(/^\//,"");

    }

    RetrieveExistingAttachments(){
        let promise = new Promise((resolve, reject) => {
            let contentid = AJS.Meta.get('content-id');
            let baseurl = AJS.params.baseUrl;
            let endpoint = JoinPath([baseurl, "/rest/api/content/", contentid,"/child/attachment"] );
            axios.get(endpoint)
                .then((response)=>{
                    let results =response.data.results.map((item)=>{return item.title});
                    let regexp = new RegExp('.*\.tmm$');
                    resolve(results.filter(item=>regexp.test(item)));
                }  )
        });
        return promise;
    }


    Render()
    {
        let promise = this.RetrieveExistingAttachments();

        promise
        .then((filenames)=>
        {
            this.RenderEditorDialog(filenames);
        })
        .then(()=>{
            let dataRenderer = new DataRenderer();
            dataRenderer.RenderSkeleton((state) => {this.data=JSON.stringify(state)}, this.CONST_EDITOR_DIALOG_BODY);
        })
        .then(()=>{
            AJS.dialog2("#demo-dialog").show();
        })
    }

    RemoveEditorDialog() {
        let dialog = document.getElementById(this.CONST_EDITOR_DIALOG);
        if(dialog!=null)
        {
            dialog.innerHTML="";
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

    GetForm(existingFileNames)
    {
        let form = document.createElement('form');
        form.className = "aui";
        form.style.height="50px";

        let paragraph = document.createElement('p');

        let form_input = document.createElement('aui-select');
        form_input.id=this.CONST_FORM_FILENAME;
        form_input.addEventListener('change',(e)=>{
            let contentid = AJS.Meta.get('content-id');
            let dataRenderer = new DataRenderer(contentid, this.GetFileNameWithExtention());
            dataRenderer.RenderRetrievingFile(this.CONST_EDITOR_DIALOG_BODY, (state)=>{this.data=JSON.stringify(state)})
        })

        existingFileNames=existingFileNames.map(item=>{return item.replace(/\.tmm$/,"")});
        existingFileNames.push("my-mind-map");
        existingFileNames=existingFileNames.filter((x, i, self) => self.indexOf(x) === i);

        let form_input_options = existingFileNames.map((item)=>{
            let element = document.createElement('aui-option');
            element.innerText=item;
            return element;
        });

        let form_label = document.createElement('aui-label');
        form_label.htmlFor=form_input.id;
        form_label.innerText="Choose existing attachment or enter new one.";

        form.appendChild(form_label);
        form.appendChild(paragraph);
        paragraph.appendChild(form_input);
        form_input_options.forEach((item)=>{form_input.appendChild(item)});

        return form;

    }

    GetBody(existingFileNames)
    {
        let body = document.createElement('div');
        body.className="aui-dialog2-content";
        body.style.height="100%";
        body.style.maxHeight="100%";


        let div = document.createElement('div');
        div.id=this.CONST_EDITOR_DIALOG_BODY;
        div.innerHTML="Generating a Mind Map Editor... :)";

        body.appendChild(this.GetForm(existingFileNames));
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
        submit_button.onclick=(e)=>{e.preventDefault(); this.InsertAttachment()};

        return footer;
    }


    RenderEditorDialog(existingAttachments)
    {
        this.RemoveEditorDialog();
        let target = document.getElementById(this.parentdom);

        let section = document.createElement('section');
        section.id=this.CONST_EDITOR_DIALOG;
        section.className="aui-dialog2 aui-dialog2-medium";
        section.style.position="absolute";
        section.style.width="100%";
        section.style.height="100%";
        section.style.zIndex=100;


        target.insertBefore(section,target.firstChild);
        section.appendChild(this.GetHeader());
        section.appendChild(this.GetBody(existingAttachments));
        section.appendChild(this.GetFooter());

    }

    InsertMacro()
    {
        let currentParams={};
        currentParams[name]=this.GetFileNameWithExtention();
        let macroRenderRequest = {
            contentId:  AJS.Meta.get('content-id'),
            macro: {
                name: "treemindmap-confluence-macro",
                params: currentParams,
                body : ""
            }
        };
        tinymce.confluence.MacroUtils.insertMacro(macroRenderRequest);
    }

    InsertAttachment(){
        if(this.GetFileNameWithExtention()===".tmm")
        {
            alert("Please specify the name of this Mind Map");
        }
        else
        {
            let contentid = AJS.Meta.get('content-id');
            let baseurl = AJS.params.baseUrl;
            let endpoint = JoinPath([baseurl, "/rest/api/content/", contentid,"/child/attachment?allowDuplicated=true"] );
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
                        endpoint = JoinPath([baseurl, "/rest/api/content/", contentid, "/child/attachment?status=draft&allowDuplicated=true"]);
                        axios.post(endpoint, params, {headers: {'X-Atlassian-Token': 'nocheck'}})
                            .then((response)=>{
                                this.InsertMacro();
                            })
                            .then((response) => {
                                this.RemoveEditorDialog()
                            })
                            .catch((error) => {
                                alert("Failed to save the mind map ;( " + error.message)
                            })
                    }
                )

        }

    }

}

