/**
 * Code editor widget module
 *
 * @param {jQuery} $
 */

/*

options.langue : soit ça contient la langue en elle même, soit ça pointe vers un autre champs (détection du caractère ./)


*/

H5PEditor.widgets.codeEditor = H5PEditor.codeEditor = (function ($) {

  /**
   * Creates an input to write code with highlight.
   *
   * @param {mixed} parent
   * @param {object} field
   * @param {mixed} params
   * @param {function} setValue
   * @returns {C}
   */
  function C(parent, field, params, setValue) {
    this.parent = parent;
    this.field = field;
    this.params = params;
    this.setValue = setValue;
  }

  /**
   * Append the field to the wrapper.
   *
   * @param {jQuery} $wrapper
   * @returns {undefined}
   */
  C.prototype.appendTo = function ($wrapper) {
    const that = this;

    this.$item = $(this.createHtml()).appendTo($wrapper);
    this.$item.addClass('h5p-code-editor');
    this.$inputs = this.$item.find('input');

    this.editor = CodeMirror(this.$item.find('.h5p-code-editor-editor')[0], {
      value: "test=5",
      lineNumbers: true,
      lineWrapping: true,
      matchBrackets: true,
      foldGutter: true,
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      styleActiveLine: {
        nonEmpty: true
      },
      showHint: true,
      extraKeys: {
        "F11": function (cm) {
          cm.setOption("fullScreen", !cm.getOption("fullScreen"));
        },
        "Esc": function (cm) {
          if (cm.getOption("fullScreen")) {
            cm.setOption("fullScreen", false);
          } else { // the user pressed the escape key, now tab will tab to the next element for accessibility
            if (!cm.state.keyMaps.some(x => x.name == 'tabAccessibility')) {
              cm.addKeyMap({
                'name': 'tabAccessibility',
                'Tab': false,
                'Shift-Tab': false
              });
            }
          }
        },
        "Ctrl-Space": "autocomplete"
      }
    });


    this.editor.on('focus', function (cm) { // On focus, make tab add tab in editor
      cm.removeKeyMap('tabAccessibility');
    });

    if (this.field.language && this.field.language[0] === '.') { // Check if language is a path
      let fieldPath = this.field.language;
      // language is a path, it should start with ./ or ../
      // if it start with ./ we remove this part because findField doesn't handle it
      if (fieldPath[1] === '/') {
        fieldPath = fieldPath.substring(2); 
      }
      this.languageField = H5PEditor.findField(fieldPath, this.parent);
      if (this.languageField === false) {
        this.field.language = 'null';
      } else {
        this.languageField.changes = [];
        H5PEditor.followField(this.parent, fieldPath, function () {
          that.applyLanguage();
        });
      }
    }


    this.applyLanguage();

    window.toto = this.editor;

    //H5P.getLibraryPath(this.parent.currentLibrary);

    //H5PEditor.libraryCache[this.parent.currentLibrary].javascript.filter;



    // alert(editor.state.doc.toString())

    /* todo : say that echap then tab */

    this.$inputs.eq(0).keydown(function (e) {

      C.saveChange(that);

    });

    this.$errors = this.$item.children('.h5p-errors');

  };

  C.prototype.applyLanguage = function () {
    if (this.field.language) {
      if (this.languageField) {
        this.setLanguage(this.languageField.value);
      } else {
        this.setLanguage(this.field.language);
      }
    } else {
      this.setLanguage('htmlmixed');
    }
  }

  C.prototype.setLanguage = function (mode) {
    if (mode === 'null') {
      this.editor.setOption('mode', null);
      return;
    }
    let modeInfo = CodeMirror.findModeByName(mode) || CodeMirror.findModeByMIME(mode);
    if (modeInfo) {
      this.editor.setOption('mode', modeInfo.mime);
      CodeMirror.autoLoadMode(this.editor, modeInfo.mode, {
        path: function (mode) {
          return H5P.getLibraryPath('H5PEditor.CodeEditor-1.0') + '/lib/codemirror/mode/' + mode + '/' + mode + '.js';
        }
      });
    } else {
      this.editor.setOption('mode', null);
    }
  }

  /**
   * Creates HTML for the widget.
   */
  C.prototype.createHtml = function () {
    const id = H5PEditor.getNextFieldId(this.field);
    const descriptionId = (this.field.description !== undefined ? H5PEditor.getDescriptionId(id) : undefined);
    const codeInput = H5PEditor.createText(this.params !== undefined ? this.params.keys : undefined, undefined, C.t('shortcut'), id, descriptionId);
    return H5PEditor.createFieldMarkup(this.field, /* codeInput */'<div class="h5p-code-editor-editor"></div>', id);

  };

  /**
   * Save changes
   */
  C.saveChange = function (that) {
    that.params = that.editor.getValue();
    that.setValue(that.field, that.params);
  };

  /**
   * Validate the current values.
   */
  C.prototype.validate = function () {
    return true;
  };

  /**
   * Remove this item.
   */
  C.prototype.remove = function () {
    this.$item.remove();
  };

  /**
   * Local translate function.
   *
   * @param {Atring} key
   * @param {Object} params
   * @returns {@exp;H5PEditor@call;t}
   */
  C.t = function (key, params) {
    return H5PEditor.t('H5PEditor.CodeEditor', key, params);
  };


  return C;
})(H5P.jQuery);