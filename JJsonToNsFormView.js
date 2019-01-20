/**
 * @NApiVersion 2.1
 */
define([], function() {
    var INTERNAL_ERROR = {
        OPTIONS_IS_REQUIRED: 'options is required',
        DEPENDENCIES_IS_REQUIRED: 'dependencies is required',
        MISSING_FORM: 'missing form',
        MISSING_FORMMODEL: 'missing form model'
    };
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    function hasOwn(obj, key) {
        return !!obj && hasOwnProperty.call(obj, key);
    }

    function forEachOwn(collection, callback, thisArg) {
        if (!collection) {
            return;
        }

        if (typeof collection.forEach === 'function') {
            collection.forEach(callback, thisArg);
            return;
        }

        for (var key in collection) {
            if (hasOwn(collection, key)) {
                callback.call(thisArg, collection[key], key);
            }
        }
    }

    function hasDefinedValue(obj, key) {
        return hasOwn(obj, key) && obj[key] !== null && obj[key] !== undefined;
    }

    function isDefinedSublistValue(value) {
        return value || value === 0 || value === false;
    }

    function getLineNumber(line) {
        var lineNumber = typeof line === 'number' ? line : parseInt(line, 10);
        return isNaN(lineNumber) ? null : lineNumber;
    }

    function applyAdditionalAttributeOnField(field, fieldInfo) {
        if (!field || !fieldInfo) {
            return;
        }

        if (hasDefinedValue(fieldInfo, 'isMandatory')) {
            field.isMandatory = fieldInfo.isMandatory;
        }

        if (fieldInfo.options && field.addSelectOption) {
            forEachOwn(fieldInfo.options, function(option) {
                field.addSelectOption(option);
            });
        }

        if (hasDefinedValue(fieldInfo, 'value')) {
            field.defaultValue = fieldInfo.value;
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
        constructor(options) {
            this._throwErrorWhenInvalidParameter(options);

            this.dependencies = options.dependencies;
            this.viewModel = options.viewModel;
            this.form = this.dependencies.form;
        }

        _throwErrorWhenInvalidParameter(options) {
            if (!options) {
                throw new Error(INTERNAL_ERROR.OPTIONS_IS_REQUIRED);
            }

            if (!options.dependencies) {
                throw new Error(INTERNAL_ERROR.DEPENDENCIES_IS_REQUIRED);
            }
        }

        _throwErrorWhenInvalidFormAndModel() {
            if (!this.form) {
                throw new Error(INTERNAL_ERROR.MISSING_FORM);
            }

            if (!this.viewModel) {
                throw new Error(INTERNAL_ERROR.MISSING_FORMMODEL);
            }
        }

        setFormTitle() {
            this._throwErrorWhenInvalidFormAndModel();

            if (hasDefinedValue(this.viewModel, 'title')) {
                this.form.title = this.viewModel.title;
            }
        }

        setClientScript() {
            this._throwErrorWhenInvalidFormAndModel();

            if (this.viewModel.clientScriptModulePath) {
                this.form.clientScriptModulePath = this.viewModel.clientScriptModulePath;
            } else if (hasDefinedValue(this.viewModel, 'clientScriptFileId')) {
                this.form.clientScriptFileId = this.viewModel.clientScriptFileId;
            }
        }

        addTabs() {
            this._throwErrorWhenInvalidFormAndModel();

            forEachOwn(this.viewModel.tabs, function(tabInfo) {
                if (!tabInfo) {
                    return;
                }

                this.form.addTab({
                    id: tabInfo.id,
                    label: tabInfo.label
                });
            }, this);

            forEachOwn(this.viewModel.subTabs, function(subTabInfo) {
                if (!subTabInfo) {
                    return;
                }

                this.form.addSubtab({
                    id: subTabInfo.id,
                    label: subTabInfo.label,
                    tab: subTabInfo.tab
                });
            }, this);
        }

        addFields() {
            this._throwErrorWhenInvalidFormAndModel();

            forEachOwn(this.viewModel.fields, function(fieldInfo) {
                this.addField(fieldInfo);
            }, this);
        }

        addField(fieldInformation) {
            this._throwErrorWhenInvalidFormAndModel();

            if (!fieldInformation || fieldInformation.skipFromRender) {
                return null;
            }

            var field;
            if (fieldInformation.fieldGroup) {
                field = this.form.addFieldGroup({
                    id: fieldInformation.id,
                    label: fieldInformation.label,
                    tab: fieldInformation.tab
                });
            } else {
                field = this.form.addField({
                    id: fieldInformation.id,
                    label: fieldInformation.label,
                    type: fieldInformation.type,
                    source: fieldInformation.source,
                    container: fieldInformation.container
                });
            }

            applyAdditionalAttributeOnField(field, fieldInformation);
            return field;
        }

        addButtons() {
            this._throwErrorWhenInvalidFormAndModel();

            forEachOwn(this.viewModel.buttons, function(buttonInfo, buttonKey) {
                if (!buttonInfo) {
                    return;
                }

                if (buttonKey === 'submit' || buttonInfo.isSubmit) {
                    this.form.addSubmitButton({
                        label: buttonInfo.label
                    });
                    return;
                }

                this.form.addButton({
                    id: buttonInfo.id,
                    label: buttonInfo.label,
                    functionName: buttonInfo.functionName
                });
            }, this);
        }

        addSublist() {
            this._throwErrorWhenInvalidFormAndModel();

            forEachOwn(this.viewModel.sublist || this.viewModel.sublists, function(sublistInfo) {
                if (!sublistInfo) {
                    return;
                }

                var sublist = this.form.addSublist({
                    id: sublistInfo.id,
                    type: sublistInfo.type,
                    tab: sublistInfo.tab,
                    label: sublistInfo.label
                });

                this._addSublistButton(sublist, sublistInfo.buttons);
                this._addSublistField(sublist, sublistInfo.fields);
                this._populateItems(sublist, sublistInfo.items);
            }, this);
        }

        _addSublistField(sublist, sublistFieldInfo) {
            forEachOwn(sublistFieldInfo, function(sbFieldInfo) {
                if (!sbFieldInfo) {
                    return;
                }

                var field = sublist.addField({
                    id: sbFieldInfo.id,
                    type: sbFieldInfo.type,
                    label: sbFieldInfo.label,
                    source: sbFieldInfo.source
                });
                applyAdditionalAttributeOnField(field, sbFieldInfo);
            });
        }

        _populateItems(sublist, items) {
            forEachOwn(items, function(data, line) {
                var lineNumber = getLineNumber(line);
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

        _addSublistButton(sublist, sublistButtonInfo) {
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

        render() {
            this.setFormTitle();
            this.setClientScript();
            this.addTabs();
            this.addFields();
            this.addSublist();
            this.addButtons();
            return this.form;
        }
    }

    return View;
});
