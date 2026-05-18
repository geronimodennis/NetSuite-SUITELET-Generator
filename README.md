# NetSuite JSON To Form View

`JsonToNsFormView` builds or extends a NetSuite `serverWidget` form from a JSON view model.

Use it for new Suitelet forms and for existing native NetSuite forms passed to User Event `beforeLoad` scripts, such as transaction, entity, item, and other record forms.

Most examples below are JavaScript object literals because NetSuite field and sublist types usually come from `N/ui/serverWidget` enums. If you load strict JSON from a file or request body, convert string type names to the matching NetSuite enum values before calling `render()`.

The project includes two versions:

- `JsonToNsFormView.js` - SuiteScript 2.1 AMD module that returns a `View` class.
- `JsonToNsFormView.ts` - TypeScript source version with local structural types.

## Advantages

Use this library when you want NetSuite form customization to be more declarative, reusable, and easier to maintain.

- Less repetitive `serverWidget` code: define fields, buttons, tabs, subtabs, field groups, and sublists in one view model instead of writing repeated API calls.
- Cleaner separation of form structure and business logic: keep request handling, searches, validation, and response logic outside the form layout definition.
- Reusable form renderer: use the same class across Suitelets and User Event `beforeLoad` customizations, changing only the JSON view model.
- Common NetSuite UI support: render form titles, client scripts, tabs, subtabs, fields, field groups, select options, buttons, sublists, sublist buttons, sublist rows, and fields or default values on existing sublists.
- Safer value handling: valid falsy values like `0` and `false` are preserved when setting field defaults and sublist row values.
- Optional sections are safe: provide only the sections you need, such as only `fields`, only `sublists`, or only `buttons`.
- JavaScript and TypeScript versions: use the SuiteScript AMD file directly or use the TypeScript source for stronger typing and maintainability.
- Easier dynamic forms: build the view model from configuration, saved search results, roles, subsidiaries, preferences, or request parameters.

## Basic Usage

Use the view inside a Suitelet after creating a NetSuite `serverWidget.Form`.

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['N/ui/serverWidget', './JsonToNsFormView'], function(serverWidget, JsonToNsFormView) {
    function onRequest(context) {
        var form = serverWidget.createForm({
            title: 'Temporary Title'
        });

        var viewModel = {
            title: 'Customer Search',
            fields: {
                customer: {
                    id: 'custpage_customer',
                    label: 'Customer',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customer',
                    isMandatory: true
                }
            },
            buttons: {
                submit: {
                    label: 'Search'
                }
            }
        };

        var view = new JsonToNsFormView({
            dependencies: {
                form: form
            },
            viewModel: viewModel
        });

        context.response.writePage(view.render());
    }

    return {
        onRequest: onRequest
    };
});
```

## Existing NetSuite Forms

You can also use the same renderer against an existing NetSuite form, usually from a User Event `beforeLoad` script. Pass `context.form` as the dependency, then add custom buttons, fields, tabs, subtabs, sublists, or sublist changes through the view model.

```javascript
/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['N/ui/serverWidget', './JsonToNsFormView'], function(serverWidget, JsonToNsFormView) {
    function beforeLoad(context) {
        var viewModel = {
            clientScriptModulePath: './CS_TransactionForm.js',
            fields: {
                reviewNote: {
                    id: 'custpage_review_note',
                    label: 'Review Note',
                    type: serverWidget.FieldType.INLINEHTML,
                    value: '<div>Please review this transaction before approval.</div>'
                }
            },
            buttons: {
                approve: {
                    id: 'custpage_approve',
                    label: 'Approve',
                    functionName: 'approveTransaction'
                }
            }
        };

        new JsonToNsFormView({
            dependencies: {
                form: context.form
            },
            viewModel: viewModel
        }).render();
    }

    return {
        beforeLoad: beforeLoad
    };
});
```

For native NetSuite forms, the available operations still depend on what NetSuite allows for that record, event type, and sublist. For example, transaction and entity forms commonly support adding custom buttons and fields in `beforeLoad`; native sublist changes depend on the specific sublist and context.

## Root JSON Shape

Every property is optional except the `form` dependency passed to the class constructor.

```javascript
{
    title: 'Form Title',
    clientScriptModulePath: './clientScript.js',
    clientScriptFileId: 12345,
    tabs: {},
    subTabs: {},
    fields: {},
    buttons: {},
    sublist: {},
    sublists: {}
}
```

Collections can be either objects or arrays:

```javascript
fields: {
    name: {id: 'custpage_name', label: 'Name', type: serverWidget.FieldType.TEXT}
}
```

```javascript
fields: [
    {id: 'custpage_name', label: 'Name', type: serverWidget.FieldType.TEXT}
]
```

Render order is:

1. Form title
2. Client script
3. Tabs and subtabs
4. Fields and field groups
5. Sublists
6. Buttons

## Form Title

```javascript
{
    title: 'Sales Order Assistant'
}
```

If `title` is present, it replaces the title from `serverWidget.createForm`.

## Client Script

Client script configuration is optional. Use it only when the form needs client-side functions, such as button handlers.

Use either `clientScriptModulePath` or `clientScriptFileId`.

```javascript
{
    clientScriptModulePath: './CS_CustomerSearch.js'
}
```

```javascript
{
    clientScriptFileId: 12345
}
```

If both are provided, `clientScriptModulePath` wins.

If neither is provided, the renderer leaves the form client script unchanged.

## Tabs

```javascript
{
    tabs: {
        main: {
            id: 'custpage_tab_main',
            label: 'Main'
        },
        results: {
            id: 'custpage_tab_results',
            label: 'Results'
        }
    }
}
```

## Subtabs

Each subtab points to its parent tab using `tab`.

```javascript
{
    tabs: {
        main: {
            id: 'custpage_tab_main',
            label: 'Main'
        }
    },
    subTabs: {
        filters: {
            id: 'custpage_subtab_filters',
            label: 'Filters',
            tab: 'custpage_tab_main'
        }
    }
}
```

## Fields

Basic field:

```javascript
{
    fields: {
        memo: {
            id: 'custpage_memo',
            label: 'Memo',
            type: serverWidget.FieldType.TEXTAREA,
            value: 'Default memo'
        }
    }
}
```

Field inside a tab or field group:

```javascript
{
    fields: {
        customer: {
            id: 'custpage_customer',
            label: 'Customer',
            type: serverWidget.FieldType.SELECT,
            source: 'customer',
            container: 'custpage_group_filters'
        }
    }
}
```

Skip a field:

```javascript
{
    fields: {
        debugOnly: {
            id: 'custpage_debug',
            label: 'Debug',
            type: serverWidget.FieldType.TEXT,
            skipFromRender: true
        }
    }
}
```

Supported field properties:

| Property | Purpose |
| --- | --- |
| `id` | NetSuite field id. Use `custpage_` ids for Suitelet fields. |
| `label` | Field label. |
| `type` | NetSuite field type, usually `serverWidget.FieldType.*`. |
| `source` | Source list or record type for select fields. |
| `container` | Tab, subtab, or field group id. |
| `tab` | Used by field groups. |
| `fieldGroup` | When `true`, creates a field group instead of a normal field. |
| `skipFromRender` | When `true`, ignores the field. |
| `isMandatory` | Sets the field as mandatory. |
| `options` | Select field options. |
| `value` | Default value. Supports `0` and `false`. |
| `breakType` | Passed to `field.updateBreakType`. |
| `layoutType` | Passed to `field.updateLayoutType`. |
| `displaySize` | Passed to `field.updateDisplaySize`. |
| `displayType` | Passed to `field.updateDisplayType`. |
| `linkText` | Link text for URL-style fields. |
| `help` | Inline help text. |
| `isCollapsible` | Field group option. |
| `isCollapsed` | Field group option. |
| `isBorderHidden` | Field group option. |
| `isSingleColumn` | Field group option. |

## Select Options

Use `options` for a select field that does not use `source`.

```javascript
{
    fields: {
        status: {
            id: 'custpage_status',
            label: 'Status',
            type: serverWidget.FieldType.SELECT,
            options: [
                {value: '', text: ''},
                {value: 'open', text: 'Open'},
                {value: 'closed', text: 'Closed', isSelected: true}
            ]
        }
    }
}
```

## Field Groups

Set `fieldGroup: true` to call `form.addFieldGroup`.

```javascript
{
    fields: {
        filtersGroup: {
            id: 'custpage_group_filters',
            label: 'Filters',
            fieldGroup: true,
            tab: 'custpage_tab_main',
            isCollapsible: true,
            isCollapsed: false,
            isSingleColumn: true
        },
        customer: {
            id: 'custpage_customer',
            label: 'Customer',
            type: serverWidget.FieldType.SELECT,
            source: 'customer',
            container: 'custpage_group_filters'
        }
    }
}
```

Create field groups before fields that use them as `container`.

## Buttons

Submit button by key:

```javascript
{
    buttons: {
        submit: {
            label: 'Submit'
        }
    }
}
```

Submit button by flag:

```javascript
{
    buttons: {
        saveButton: {
            label: 'Save',
            isSubmit: true
        }
    }
}
```

Client button:

```javascript
{
    clientScriptModulePath: './CS_Form.js',
    buttons: {
        refresh: {
            id: 'custpage_refresh',
            label: 'Refresh',
            functionName: 'refreshPage'
        }
    }
}
```

Supported button properties:

| Property | Purpose |
| --- | --- |
| `id` | Button id. Required for non-submit buttons. |
| `label` | Button label. |
| `functionName` | Client script function name for non-submit buttons. |
| `isSubmit` | When `true`, calls `form.addSubmitButton`. |

## Sublists

Use either `sublist` or `sublists`. They behave the same.

By default, each entry creates a new sublist with `form.addSublist`.

```javascript
{
    sublist: {
        items: {
            id: 'custpage_items',
            label: 'Items',
            type: serverWidget.SublistType.LIST,
            fields: {
                itemName: {
                    id: 'custpage_item_name',
                    label: 'Item',
                    type: serverWidget.FieldType.TEXT
                },
                amount: {
                    id: 'custpage_amount',
                    label: 'Amount',
                    type: serverWidget.FieldType.CURRENCY
                }
            },
            items: [
                {
                    custpage_item_name: 'Service Fee',
                    custpage_amount: 150
                },
                {
                    custpage_item_name: 'Discount',
                    custpage_amount: 0
                }
            ]
        }
    }
}
```

To work with an existing native sublist, set `useExisting: true`. The renderer will call `form.getSublist({id: ...})`, then apply any configured sublist fields, buttons, and row values where NetSuite permits them.

```javascript
{
    sublists: {
        item: {
            id: 'item',
            useExisting: true,
            fields: {
                availableQty: {
                    id: 'custpage_available_qty',
                    label: 'Available Qty',
                    type: serverWidget.FieldType.FLOAT
                }
            },
            items: [
                {custpage_available_qty: 10},
                {custpage_available_qty: 0}
            ]
        }
    }
}
```

`existing: true` is also supported as an alias for `useExisting: true`.

Sublist inside a tab:

```javascript
{
    tabs: {
        results: {
            id: 'custpage_tab_results',
            label: 'Results'
        }
    },
    sublists: {
        results: {
            id: 'custpage_results',
            label: 'Results',
            type: serverWidget.SublistType.LIST,
            tab: 'custpage_tab_results',
            fields: {
                name: {
                    id: 'custpage_name',
                    label: 'Name',
                    type: serverWidget.FieldType.TEXT
                }
            },
            items: [
                {custpage_name: 'ABC Company'}
            ]
        }
    }
}
```

Sublist with buttons:

```javascript
{
    clientScriptModulePath: './CS_Form.js',
    sublist: {
        items: {
            id: 'custpage_items',
            label: 'Items',
            type: serverWidget.SublistType.INLINEEDITOR,
            buttons: {
                markAll: {
                    id: 'custpage_mark_all',
                    label: 'Mark All',
                    functionName: 'markAllLines'
                }
            },
            fields: {
                selected: {
                    id: 'custpage_selected',
                    label: 'Selected',
                    type: serverWidget.FieldType.CHECKBOX
                }
            },
            items: [
                {custpage_selected: false}
            ]
        }
    }
}
```

Supported sublist properties:

| Property | Purpose |
| --- | --- |
| `id` | Sublist id. |
| `type` | NetSuite sublist type, usually `serverWidget.SublistType.*`. |
| `tab` | Optional tab id. |
| `label` | Sublist label. |
| `useExisting` | When `true`, uses `form.getSublist` instead of `form.addSublist`. |
| `existing` | Alias for `useExisting`. |
| `buttons` | Sublist-level buttons. |
| `fields` | Sublist fields. |
| `items` | Rows to populate. Object keys must match sublist field ids. |

Sublist values support strings, numbers, booleans, and dates. The renderer keeps valid falsy values like `0` and `false`.

## Common JSON Combinations

Minimal title-only form:

```javascript
{
    title: 'Blank Form'
}
```

Title plus fields:

```javascript
{
    title: 'Simple Entry',
    fields: {
        name: {
            id: 'custpage_name',
            label: 'Name',
            type: serverWidget.FieldType.TEXT,
            isMandatory: true
        }
    }
}
```

Title plus fields and submit button:

```javascript
{
    title: 'Simple Entry',
    fields: {
        name: {
            id: 'custpage_name',
            label: 'Name',
            type: serverWidget.FieldType.TEXT
        }
    },
    buttons: {
        submit: {
            label: 'Save'
        }
    }
}
```

Tabs plus grouped fields:

```javascript
{
    title: 'Tabbed Form',
    tabs: {
        main: {
            id: 'custpage_tab_main',
            label: 'Main'
        }
    },
    fields: {
        detailsGroup: {
            id: 'custpage_group_details',
            label: 'Details',
            fieldGroup: true,
            tab: 'custpage_tab_main'
        },
        memo: {
            id: 'custpage_memo',
            label: 'Memo',
            type: serverWidget.FieldType.TEXTAREA,
            container: 'custpage_group_details'
        }
    }
}
```

Filters plus results:

```javascript
{
    title: 'Search',
    clientScriptModulePath: './CS_Search.js',
    fields: {
        customer: {
            id: 'custpage_customer',
            label: 'Customer',
            type: serverWidget.FieldType.SELECT,
            source: 'customer'
        }
    },
    buttons: {
        submit: {
            label: 'Search'
        },
        reset: {
            id: 'custpage_reset',
            label: 'Reset',
            functionName: 'resetFilters'
        }
    },
    sublist: {
        results: {
            id: 'custpage_results',
            label: 'Results',
            type: serverWidget.SublistType.LIST,
            fields: {
                entity: {
                    id: 'custpage_entity',
                    label: 'Entity',
                    type: serverWidget.FieldType.TEXT
                },
                total: {
                    id: 'custpage_total',
                    label: 'Total',
                    type: serverWidget.FieldType.CURRENCY
                }
            },
            items: [
                {custpage_entity: 'ABC Company', custpage_total: 1000},
                {custpage_entity: 'XYZ Company', custpage_total: 0}
            ]
        }
    }
}
```

Full combination:

```javascript
{
    title: 'Full Demo',
    clientScriptModulePath: './CS_FullDemo.js',
    tabs: {
        main: {
            id: 'custpage_tab_main',
            label: 'Main'
        },
        results: {
            id: 'custpage_tab_results',
            label: 'Results'
        }
    },
    subTabs: {
        filters: {
            id: 'custpage_subtab_filters',
            label: 'Filters',
            tab: 'custpage_tab_main'
        }
    },
    fields: {
        filterGroup: {
            id: 'custpage_group_filters',
            label: 'Filters',
            fieldGroup: true,
            tab: 'custpage_tab_main',
            isCollapsible: true
        },
        status: {
            id: 'custpage_status',
            label: 'Status',
            type: serverWidget.FieldType.SELECT,
            container: 'custpage_group_filters',
            options: [
                {value: '', text: ''},
                {value: 'open', text: 'Open'},
                {value: 'closed', text: 'Closed'}
            ],
            value: 'open',
            help: 'Choose a status to filter the result list.'
        }
    },
    buttons: {
        submit: {
            label: 'Run'
        },
        clear: {
            id: 'custpage_clear',
            label: 'Clear',
            functionName: 'clearForm'
        }
    },
    sublists: {
        results: {
            id: 'custpage_results',
            label: 'Results',
            type: serverWidget.SublistType.LIST,
            tab: 'custpage_tab_results',
            buttons: {
                export: {
                    id: 'custpage_export',
                    label: 'Export',
                    functionName: 'exportResults'
                }
            },
            fields: {
                selected: {
                    id: 'custpage_selected',
                    label: 'Selected',
                    type: serverWidget.FieldType.CHECKBOX
                },
                name: {
                    id: 'custpage_name',
                    label: 'Name',
                    type: serverWidget.FieldType.TEXT
                },
                amount: {
                    id: 'custpage_amount',
                    label: 'Amount',
                    type: serverWidget.FieldType.CURRENCY
                }
            },
            items: [
                {custpage_selected: false, custpage_name: 'Row 1', custpage_amount: 100},
                {custpage_selected: true, custpage_name: 'Row 2', custpage_amount: 0}
            ]
        }
    }
}
```

## TypeScript

The TypeScript version keeps the same AMD runtime shape:

```typescript
define([], function() {
    return View;
});
```

Strict type-check example:

```powershell
npx.cmd --yes -p typescript tsc --noEmit --target ES2020 --module amd --strict --ignoreDeprecations 6.0 .\JsonToNsFormView.ts
```

If your project already has a TypeScript build, add the file to that build and compile it using the module format expected by your SuiteScript upload/deploy process.

## Notes

- Use NetSuite enum values from `N/ui/serverWidget` for `type`, `displayType`, `layoutType`, and `breakType`.
- Use `custpage_` ids for custom Suitelet fields, tabs, buttons, and sublists.
- Create tabs, subtabs, and field groups before fields or sublists that reference them.
- For existing native sublists, set `useExisting: true`; `type`, `tab`, and `label` are only needed when creating a new sublist.
- Empty strings are not written to sublist rows. Values `0` and `false` are written.
- `clientScriptModulePath` and `clientScriptFileId` should not both be used; when both exist, module path wins.
