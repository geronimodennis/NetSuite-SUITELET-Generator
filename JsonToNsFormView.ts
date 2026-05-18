/**
 * @NApiVersion 2.1
 */
type Collection<T> = T[] | {[key: string]: T} | null | undefined;
type FieldValue = string | number | boolean | Date;

interface ViewOptions {
    dependencies?: ViewDependencies;
    viewModel?: ViewModel;
}

interface ViewDependencies {
    form?: NsForm;
    [key: string]: unknown;
}

interface ViewModel {
    title?: string;
    clientScriptModulePath?: string;
    clientScriptFileId?: string | number;
    tabs?: Collection<TabInfo>;
    subTabs?: Collection<SubTabInfo>;
    fields?: Collection<FieldInfo>;
    buttons?: Collection<ButtonInfo>;
    sublist?: Collection<SublistInfo>;
    sublists?: Collection<SublistInfo>;
}

interface TabInfo {
    id?: string;
    label?: string;
}

interface SubTabInfo extends TabInfo {
    tab?: string;
}

interface ButtonInfo {
    id?: string;
    label?: string;
    functionName?: string;
    isSubmit?: boolean;
}

interface SelectOption {
    value?: string;
    text?: string;
    isSelected?: boolean;
    [key: string]: unknown;
}

interface FieldInfo {
    id?: string;
    label?: string;
    type?: string;
    source?: string;
    container?: string;
    tab?: string;
    fieldGroup?: boolean;
    skipFromRender?: boolean;
    isMandatory?: boolean;
    options?: Collection<SelectOption>;
    value?: FieldValue | null;
    breakType?: unknown;
    layoutType?: unknown;
    displaySize?: unknown;
    displayType?: unknown;
    linkText?: string;
    help?: string;
    isCollapsible?: boolean;
    isCollapsed?: boolean;
    isBorderHidden?: boolean;
    isSingleColumn?: boolean;
}

interface SublistInfo {
    id?: string;
    type?: string;
    tab?: string;
    label?: string;
    buttons?: Collection<ButtonInfo>;
    fields?: Collection<FieldInfo>;
    items?: Collection<SublistRow>;
}

interface SublistRow {
    [fieldId: string]: FieldValue | null | undefined;
}

interface NsForm {
    title?: string;
    clientScriptModulePath?: string;
    clientScriptFileId?: string | number;
    addTab(options: TabInfo): unknown;
    addSubtab(options: SubTabInfo): unknown;
    addField(options: FieldOptions): NsField;
    addFieldGroup(options: FieldGroupOptions): NsField;
    addButton(options: ButtonOptions): unknown;
    addSubmitButton(options: SubmitButtonOptions): unknown;
    addSublist(options: SublistOptions): NsSublist;
}

interface NsField {
    isMandatory?: boolean;
    defaultValue?: FieldValue;
    linkText?: string;
    isCollapsible?: boolean;
    isCollapsed?: boolean;
    isBorderHidden?: boolean;
    isSingleColumn?: boolean;
    addSelectOption?(option: SelectOption): void;
    updateBreakType?(options: {breakType: unknown}): void;
    updateLayoutType?(options: {layoutType: unknown}): void;
    updateDisplaySize?(options: unknown): void;
    updateDisplayType?(options: {displayType: unknown}): void;
    setHelpText?(options: {help: string; showInlineForAssistant: boolean}): void;
}

interface NsSublist {
    addButton(options: ButtonOptions): unknown;
    addField(options: SublistFieldOptions): NsField;
    setSublistValue(options: {id: string; line: number; value: FieldValue}): void;
}

interface FieldOptions {
    id?: string;
    label?: string;
    type?: string;
    source?: string;
    container?: string;
}

interface FieldGroupOptions {
    id?: string;
    label?: string;
    tab?: string;
}

interface SublistFieldOptions {
    id?: string;
    type?: string;
    label?: string;
    source?: string;
}

interface ButtonOptions {
    id?: string;
    label?: string;
    functionName?: string;
}

interface SubmitButtonOptions {
    label?: string;
}

interface SublistOptions {
    id?: string;
    type?: string;
    tab?: string;
    label?: string;
}

const INTERNAL_ERROR = {
    OPTIONS_IS_REQUIRED: 'options is required',
    DEPENDENCIES_IS_REQUIRED: 'dependencies is required',
    MISSING_FORM: 'missing form',
    MISSING_FORMMODEL: 'missing form model'
};
const hasOwnProperty = Object.prototype.hasOwnProperty;

function hasOwn(obj: unknown, key: string): obj is Record<string, unknown> {
    return !!obj && hasOwnProperty.call(obj, key);
}

function forEachOwn<T>(
    collection: Collection<T>,
    callback: (value: T, key: string | number) => void,
    thisArg?: unknown
): void {
    if (!collection) {
        return;
    }

    if (Array.isArray(collection)) {
        collection.forEach(function(value, index) {
            callback.call(thisArg, value, index);
        });
        return;
    }

    Object.keys(collection).forEach(function(key) {
        callback.call(thisArg, collection[key], key);
    });
}

function hasDefinedValue(obj: unknown, key: string): boolean {
    return hasOwn(obj, key) && obj[key] !== null && obj[key] !== undefined;
}

function isDefinedSublistValue(value: FieldValue | null | undefined): value is FieldValue {
    return Boolean(value) || value === 0 || value === false;
}

function getLineNumber(line: string | number): number | null {
    const lineNumber = typeof line === 'number' ? line : parseInt(line, 10);
    return isNaN(lineNumber) ? null : lineNumber;
}

function applyAdditionalAttributeOnField(field: NsField | null | undefined, fieldInfo: FieldInfo | null | undefined): void {
    if (!field || !fieldInfo) {
        return;
    }

    if (hasDefinedValue(fieldInfo, 'isMandatory')) {
        field.isMandatory = fieldInfo.isMandatory;
    }

    if (fieldInfo.options && field.addSelectOption) {
        forEachOwn(fieldInfo.options, function(option) {
            field.addSelectOption!(option);
        });
    }

    if (hasDefinedValue(fieldInfo, 'value')) {
        field.defaultValue = fieldInfo.value as FieldValue;
    }

    if (fieldInfo.breakType && field.updateBreakType) {
        field.updateBreakType({
            breakType: fieldInfo.breakType
        });
    }

    if (fieldInfo.layoutType && field.updateLayoutType) {
        field.updateLayoutType({
            layoutType: fieldInfo.layoutType
        });
    }

    if (fieldInfo.displaySize && field.updateDisplaySize) {
        field.updateDisplaySize(fieldInfo.displaySize);
    }

    if (fieldInfo.displayType && field.updateDisplayType) {
        field.updateDisplayType({
            displayType: fieldInfo.displayType
        });
    }

    if (hasDefinedValue(fieldInfo, 'linkText')) {
        field.linkText = fieldInfo.linkText;
    }

    if (fieldInfo.help && field.setHelpText) {
        field.setHelpText({help: fieldInfo.help, showInlineForAssistant: true});
    }

    if (hasDefinedValue(fieldInfo, 'isCollapsible')) {
        field.isCollapsible = fieldInfo.isCollapsible;
    }

    if (hasDefinedValue(fieldInfo, 'isCollapsed')) {
        field.isCollapsed = fieldInfo.isCollapsed;
    }

    if (hasDefinedValue(fieldInfo, 'isBorderHidden')) {
        field.isBorderHidden = fieldInfo.isBorderHidden;
    }

    if (hasDefinedValue(fieldInfo, 'isSingleColumn')) {
        field.isSingleColumn = fieldInfo.isSingleColumn;
    }
}

class View {
    private dependencies: ViewDependencies = {};
    private viewModel?: ViewModel;
    private form?: NsForm;

    constructor(options?: ViewOptions) {
        this.throwErrorWhenInvalidParameter(options);

        this.dependencies = options.dependencies as ViewDependencies;
        this.viewModel = options.viewModel;
        this.form = this.dependencies.form;
    }

    private throwErrorWhenInvalidParameter(options?: ViewOptions): asserts options is ViewOptions & {dependencies: ViewDependencies} {
        if (!options) {
            throw new Error(INTERNAL_ERROR.OPTIONS_IS_REQUIRED);
        }

        if (!options.dependencies) {
            throw new Error(INTERNAL_ERROR.DEPENDENCIES_IS_REQUIRED);
        }
    }

    private requireFormAndViewModel(): {form: NsForm; viewModel: ViewModel} {
        if (!this.form) {
            throw new Error(INTERNAL_ERROR.MISSING_FORM);
        }

        if (!this.viewModel) {
            throw new Error(INTERNAL_ERROR.MISSING_FORMMODEL);
        }

        return {
            form: this.form,
            viewModel: this.viewModel
        };
    }

    setFormTitle(): void {
        const {form, viewModel} = this.requireFormAndViewModel();

        if (hasDefinedValue(viewModel, 'title')) {
            form.title = viewModel.title;
        }
    }

    setClientScript(): void {
        const {form, viewModel} = this.requireFormAndViewModel();

        if (viewModel.clientScriptModulePath) {
            form.clientScriptModulePath = viewModel.clientScriptModulePath;
        } else if (hasDefinedValue(viewModel, 'clientScriptFileId')) {
            form.clientScriptFileId = viewModel.clientScriptFileId;
        }
    }

    addTabs(): void {
        const {form, viewModel} = this.requireFormAndViewModel();

        forEachOwn(viewModel.tabs, function(tabInfo) {
            if (!tabInfo) {
                return;
            }

            form.addTab({
                id: tabInfo.id,
                label: tabInfo.label
            });
        });

        forEachOwn(viewModel.subTabs, function(subTabInfo) {
            if (!subTabInfo) {
                return;
            }

            form.addSubtab({
                id: subTabInfo.id,
                label: subTabInfo.label,
                tab: subTabInfo.tab
            });
        });
    }

    addFields(): void {
        const {viewModel} = this.requireFormAndViewModel();

        forEachOwn(viewModel.fields, (fieldInfo) => {
            this.addField(fieldInfo);
        });
    }

    addField(fieldInformation?: FieldInfo | null): NsField | null {
        const {form} = this.requireFormAndViewModel();

        if (!fieldInformation || fieldInformation.skipFromRender) {
            return null;
        }

        const field = fieldInformation.fieldGroup
            ? form.addFieldGroup({
                id: fieldInformation.id,
                label: fieldInformation.label,
                tab: fieldInformation.tab
            })
            : form.addField({
                id: fieldInformation.id,
                label: fieldInformation.label,
                type: fieldInformation.type,
                source: fieldInformation.source,
                container: fieldInformation.container
            });

        applyAdditionalAttributeOnField(field, fieldInformation);
        return field;
    }

    addButtons(): void {
        const {form, viewModel} = this.requireFormAndViewModel();

        forEachOwn(viewModel.buttons, function(buttonInfo, buttonKey) {
            if (!buttonInfo) {
                return;
            }

            if (buttonKey === 'submit' || buttonInfo.isSubmit) {
                form.addSubmitButton({
                    label: buttonInfo.label
                });
                return;
            }

            form.addButton({
                id: buttonInfo.id,
                label: buttonInfo.label,
                functionName: buttonInfo.functionName
            });
        });
    }

    addSublist(): void {
        const {form, viewModel} = this.requireFormAndViewModel();

        forEachOwn(viewModel.sublist || viewModel.sublists, (sublistInfo) => {
            if (!sublistInfo) {
                return;
            }

            const sublist = form.addSublist({
                id: sublistInfo.id,
                type: sublistInfo.type,
                tab: sublistInfo.tab,
                label: sublistInfo.label
            });

            this.addSublistButton(sublist, sublistInfo.buttons);
            this.addSublistField(sublist, sublistInfo.fields);
            this.populateItems(sublist, sublistInfo.items);
        });
    }

    private addSublistField(sublist: NsSublist, sublistFieldInfo: Collection<FieldInfo>): void {
        forEachOwn(sublistFieldInfo, function(sbFieldInfo) {
            if (!sbFieldInfo) {
                return;
            }

            const field = sublist.addField({
                id: sbFieldInfo.id,
                type: sbFieldInfo.type,
                label: sbFieldInfo.label,
                source: sbFieldInfo.source
            });
            applyAdditionalAttributeOnField(field, sbFieldInfo);
        });
    }

    private populateItems(sublist: NsSublist, items: Collection<SublistRow>): void {
        forEachOwn(items, function(data, line) {
            const lineNumber = getLineNumber(line);
            if (lineNumber === null) {
                return;
            }

            forEachOwn(data, function(dataValue, key) {
                if (isDefinedSublistValue(dataValue)) {
                    sublist.setSublistValue({
                        id: String(key),
                        line: lineNumber,
                        value: dataValue
                    });
                }
            });
        });
    }

    private addSublistButton(sublist: NsSublist, sublistButtonInfo: Collection<ButtonInfo>): void {
        forEachOwn(sublistButtonInfo, function(sbButtonsInfo) {
            if (!sbButtonsInfo) {
                return;
            }

            sublist.addButton({
                id: sbButtonsInfo.id,
                label: sbButtonsInfo.label,
                functionName: sbButtonsInfo.functionName
            });
        });
    }

    render(): NsForm {
        this.setFormTitle();
        this.setClientScript();
        this.addTabs();
        this.addFields();
        this.addSublist();
        this.addButtons();
        return this.requireFormAndViewModel().form;
    }
}

declare function define(dependencies: string[], factory: () => typeof View): void;

define([], function() {
    return View;
});
