package EyaaEyaa;

import com.atlassian.confluence.content.render.xhtml.ConversionContext;
import com.atlassian.confluence.content.render.xhtml.XhtmlException;
import com.atlassian.confluence.macro.Macro;
import com.atlassian.confluence.macro.MacroExecutionException;
import com.atlassian.confluence.util.velocity.VelocityUtils;
import com.atlassian.confluence.renderer.radeox.macros.MacroUtils;
import com.atlassian.confluence.xhtml.api.MacroDefinition;
import com.atlassian.confluence.xhtml.api.MacroDefinitionHandler;
import com.atlassian.confluence.xhtml.api.XhtmlContent;
import com.atlassian.plugin.spring.scanner.annotation.component.Scanned;
import com.atlassian.plugin.spring.scanner.annotation.imports.ComponentImport;
import com.atlassian.plugin.spring.scanner.annotation.imports.ConfluenceImport;
import com.atlassian.confluence.pages.Attachment;
import com.atlassian.confluence.setup.settings.SettingsManager;
import java.io.*;
import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import javax.inject.Inject;
import java.util.Map;


@Scanned
public class MindMapMacro implements Macro{
    private final XhtmlContent xhtmlUtils;


    @ConfluenceImport
    private  SettingsManager settingsManager;

    @Inject
    public void setSettingsManager(SettingsManager settingsManager){
        this.settingsManager=settingsManager;
    }

    @Autowired
    public MindMapMacro(@ComponentImport XhtmlContent xhtmlUtils) {
        this.xhtmlUtils = xhtmlUtils;
    }

    public String execute(Map<String, String> params, String bodyContent, ConversionContext conversionContext) throws MacroExecutionException {
        String body = conversionContext.getEntity().getBodyAsString();
        final List<MacroDefinition> macros = new ArrayList<MacroDefinition>();

        try {
            xhtmlUtils.handleMacroDefinitions(body, conversionContext, new MacroDefinitionHandler() {
                public void handle(MacroDefinition macroDefinition) {
                    macros.add(macroDefinition);
                }
            });
        } catch (XhtmlException e) {
            throw new MacroExecutionException(e);
        }

        Map context = MacroUtils.defaultVelocityContext();
        Random rnd = new Random();
        String selected_file =  params.get("name");
        //String key = "TreeMindMapMacro-" + selected_file + "-" + String.valueOf(rnd.nextInt());
        String key = "TreeMindMapMacro-" + String.valueOf(rnd.nextInt());
        context.put("key",key);
        context.put("url", this.GetAttachmentDownloadURL(selected_file, conversionContext));

        return VelocityUtils.getRenderedTemplate("templates/mindmap-macro.vm", context);

    }

    private String GetAttachmentDownloadURL(String attachmentName, ConversionContext conversionContext)
    {
        String baseUrl = this.settingsManager.getGlobalSettings().getBaseUrl();

        for (Attachment attachment :conversionContext.getPageContext().getEntity().getAttachments())
        {
            System.out.println("Getting attahchment: "+ attachment.getFileName() + " comparing with " + attachmentName );
            if((attachment.getFileName()).equals(attachmentName) && attachment.isLatestVersion())
            {
                return this.BuildPath(baseUrl,attachment.getDownloadPath());
            }
        }
        return "";
    }

    private String BuildPath(String url1, String url2)
    {
        url1 = url1.replaceAll("/$","");
        url2 = url2.replaceAll("^/","");
        return url1 + "/" + url2;
    }


    public BodyType getBodyType() {
        return BodyType.NONE;
    }

    public OutputType getOutputType() {
        return OutputType.BLOCK;
    }
}