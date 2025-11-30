import { customElement, html } from "@umbraco-cms/backoffice/external/lit";
import { UmbCollectionDefaultElement } from "@umbraco-cms/backoffice/collection";
import { UAI_PROMPT_COLLECTION_ALIAS } from "./constants.js";

@customElement("uai-prompt-collection")
export class UaiPromptCollectionElement extends UmbCollectionDefaultElement {
    constructor() {
        super();
        this._collectionAlias = UAI_PROMPT_COLLECTION_ALIAS;
    }

    protected override renderToolbar() {
        return html`<umb-collection-toolbar slot="header"></umb-collection-toolbar>`;
    }
}

export default UaiPromptCollectionElement;

declare global {
    interface HTMLElementTagNameMap {
        "uai-prompt-collection": UaiPromptCollectionElement;
    }
}
