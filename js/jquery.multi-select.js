/*
* MultiSelect v0.9
* Copyright (c) 2012 Louis Cuny
*
* This program is free software. It comes without any warranty, to
* the extent permitted by applicable law. You can redistribute it
* and/or modify it under the terms of the Do What The Fuck You Want
* To Public License, Version 2, as published by Sam Hocevar. See
* http://sam.zoy.org/wtfpl/COPYING for more details.
*/

!function ($) {

  "use strict"; // jshint ;_;


 /* MULTISELECT CLASS DEFINITION
  * ====================== */

  var MultiSelect = function (element, options) {
    this.options = options;
    this.$element = $(element);
    this.init();
  }

  MultiSelect.prototype = {
    constructor: MultiSelect,

    init: function(){

      var that = this,
          ms = this.$element,
          container,
          selectableContainer,
          selectionContainer,
          selectableUl,
          selectionUl;

      if (ms.next('.ms-container').length == 0){
        ms.css({ position: 'absolute', left: '-9999px' });
        ms.attr('id', ms.attr('id') ? ms.attr('id') : 'ms-'+Math.ceil(Math.random()*1000));
        container = $('<div id="ms-'+ms.attr('id')+'" class="ms-container"></div>'),
        selectableContainer = $('<div class="ms-selectable"></div>'),
        selectionContainer = $('<div class="ms-selection"></div>'),
        selectableUl = $('<ul class="ms-list"></ul>'),
        selectionUl = $('<ul class="ms-list"></ul>');

        var optgroupLabel = null,
            optgroupId = null,
            optgroupCpt = 0,
            scroll = 0;


        ms.find('optgroup, option').each(function(){
          if ($(this).is('optgroup')){
            optgroupLabel = $(this).attr('label');
            optgroupId = 'ms-'+ms.attr('id')+'-optgroup-'+optgroupCpt;

            selectableUl.append(
              '<li class="ms-optgroup-container" id="'+optgroupId+'-selectable">\
                <ul class="ms-optgroup">\
                  <li class="ms-optgroup-label"><span>'+optgroupLabel+'</span></li>\
                </ul>\
              </li>');
            selectionUl.append(
              '<li class="ms-optgroup-container" id="'+optgroupId+'-selection">\
                <ul class="ms-optgroup">\
                  <li class="ms-optgroup-label"><span>'+optgroupLabel+'</span></li>\
                </ul>\
              </li>');
            optgroupCpt++;
          } else {

            var attributes = "";

            for (var cpt = 0; cpt < this.attributes.length; cpt++){
              var attr = this.attributes[cpt],
                  name = (attr.name == 'value') ? 'ms-value' : attr.name;

              attributes += name+'="'+attr.value+'" ';
            }
            var selectableLi = $('<li '+attributes+'><span>'+$(this).text()+'</span></li>'),
                selectedLi = selectableLi.clone();

            selectableLi.addClass('ms-elem-selectable');
            selectedLi.addClass('ms-elem-selection').hide();
            selectionUl.find('.ms-optgroup-label').hide();

            if ($(this).prop('disabled') || ms.prop('disabled')){
              selectableLi.prop('disabled', true);
              selectableLi.addClass(that.options.disabledClass);
            }

            if (optgroupId){
              selectableUl.children('#'+optgroupId+'-selectable').find('ul').first().append(selectableLi);
              selectionUl.children('#'+optgroupId+'-selection').find('ul').first().append(selectedLi);
            } else {
              selectableUl.append(selectableLi);
              selectionUl.append(selectedLi);
            }
          }
        });

        if (that.options.selectableHeader){
          selectableContainer.append(that.options.selectableHeader);
        }
        selectableContainer.append(selectableUl);
        
        if (that.options.selectionHeader){
          selectionContainer.append(that.options.selectionHeader);
        }
        selectionContainer.append(selectionUl);

        container.append(selectableContainer);
        container.append(selectionContainer);

        ms.after(container);

        ms.find('option:selected').each(function(){
          that.select($(this).val(), 'init');
        });

        selectableUl.on('mouseenter', '.ms-elem-selectable', function(){
          $('li', container).removeClass('ms-hover');
          $(this).addClass('ms-hover');
        }).on('mouseout', function(){
          $('li', container).removeClass('ms-hover');
        });

        if(that.options.dblClick) {
          selectableUl.on('dblclick', '.ms-elem-selectable', function(){
            that.select($(this).attr('ms-value'));
          });
          selectionUl.on('dblclick', '.ms-elem-selection', function(){
            that.deselect($(this).attr('ms-value'));
          });
        } else {
          selectableUl.on('click', '.ms-elem-selectable', function(){
            that.select($(this).attr('ms-value'));
          });
          selectionUl.on('click', '.ms-elem-selection', function(){
            that.deselect($(this).attr('ms-value'));
          });
        }

        selectionUl.on('mouseenter', '.ms-elem-selection', function(){
          $('li', selectionUl).removeClass('ms-hover');
          $(this).addClass('ms-hover');
        }).on('mouseout', function(){
          $('li', selectionUl).removeClass('ms-hover');
        });

        selectableUl.on('focusin', function(){
          $(this).addClass('ms-focus');
          selectionUl.focusout();
        }).on('focusout', function(){
          $(this).removeClass('ms-focus');
          $('li', container).removeClass('ms-hover');
        });

        selectionUl.on('focusin', function(){
          $(this).addClass('ms-focus');
        }).on('focusout', function(){
          $(this).removeClass('ms-focus');
          $('li', container).removeClass('ms-hover');
        });

        ms.on('focusin', function(){
          selectableUl.focus();
        }).on('focusout', function(){
          selectableUl.removeClass('ms-focus');
          selectionUl.removeClass('ms-focus');
        });

        ms.onKeyDown = function(e, keyContainer){
          var selectables = $('.'+keyContainer+' li:visible:not(.ms-optgroup-label, .ms-optgroup-container)', container),
              selectablesLength = selectables.length,
              selectableFocused = $('.'+keyContainer+' li.ms-hover', container),
              selectableFocusedIndex = $('.'+keyContainer+' li:visible:not(.ms-optgroup-label, .ms-optgroup-container)', container).index(selectableFocused),
              liHeight = selectables.first().outerHeight(),
              numberOfItemsDisplayed = Math.ceil(container.outerHeight()/liHeight),
              scrollStart = Math.ceil(numberOfItemsDisplayed/4);

          selectables.removeClass('ms-hover');
          if (e.keyCode == 32){ // space
            var method = keyContainer == 'ms-selectable' ? 'select' : 'deselect';
            if (keyContainer == 'ms-selectable'){
              that.select(selectableFocused.first().attr('ms-value'));
            } else {
              that.deselect(selectableFocused.first().attr('ms-value'));
            }

          } else if (e.keyCode == 40){ // Down
            var nextIndex = (selectableFocusedIndex+1 != selectablesLength) ? selectableFocusedIndex+1 : 0,
                nextSelectableLi = selectables.eq(nextIndex);

            nextSelectableLi.addClass('ms-hover');
            if (nextIndex > scrollStart){
              scroll += liHeight;
            } else if (nextIndex == 0){
              scroll = 0;
            }
            $('.'+keyContainer+' ul', container).scrollTop(scroll);
          } else if (e.keyCode == 38){ // Up
            var prevIndex = (selectableFocusedIndex-1 >= 0) ? selectableFocusedIndex-1 : selectablesLength-1,
                prevSelectableLi = selectables.eq(prevIndex);
            selectables.removeClass('ms-hover');
            prevSelectableLi.addClass('ms-hover');
            if (selectablesLength-prevIndex+1 < scrollStart){
              scroll = liHeight*(selectablesLength-scrollStart);
            } else {
              scroll -= liHeight;
            }
            $('.'+keyContainer+' ul', container).scrollTop(scroll);
          } else if (e.keyCode == 37 || e.keyCode == 39){ // Right and Left
            if (selectableUl.hasClass('ms-focus')){
              selectableUl.focusout();
              selectionUl.focusin();
            } else {
              selectableUl.focusin();
              selectionUl.focusout();
            }
          }
        }

        ms.on('keydown', function(e){
          if (ms.is(':focus')){
            var keyContainer = selectableUl.hasClass('ms-focus') ? 'ms-selectable' : 'ms-selection';
            ms.onKeyDown(e, keyContainer);
          }
        });
      }
      if (typeof that.options.afterInit == 'function') {
        that.options.afterInit.call(this, container);
      }
    },
    'refresh' : function() {
      $("#ms-"+this.$element.attr("id")).remove();
      this.init(this.options);
    },
    'select' : function(value, method){
      var that = this,
          ms = this.$element;

      if (typeof value == 'string'){
        var selectableUl = $('#ms-'+ms.attr('id')+' .ms-selectable ul.ms-list'),
            selectionUl = $('#ms-'+ms.attr('id')+' .ms-selection ul.ms-list'),
            selectedOption = ms.find('option[value="'+value +'"]'),
            selectedLi = selectionUl.find('li[ms-value="'+value+'"]'),
            selectableLi = selectableUl.find('li[ms-value="'+value+'"]'),
            haveToSelect;

        if (method == 'init'){
          haveToSelect = !selectableLi.hasClass(that.options.disabledClass) && selectedOption.prop('selected');
        } else {
          haveToSelect = !selectableLi.hasClass(that.options.disabledClass);
          ms.focus();
        }

        if (haveToSelect && selectedLi.is(':hidden')){
          var selectableOptgroup = selectableLi.parent('.ms-optgroup');

          if (selectableOptgroup.length > 0)
            if (selectableOptgroup.children('.ms-elem-selectable:not(.ms-selected)').length == 1)
              selectableOptgroup.children('.ms-optgroup-label').hide();

          if (selectedLi.parent('.ms-optgroup').length > 0){
            selectedLi.prevAll('.ms-optgroup-label').show();
          }

          selectedOption.prop('selected', true);
          selectableLi.addClass('ms-selected').hide();
          selectedLi.addClass('ms-selected').show();
          if (method != 'init'){
            ms.trigger('change');
            if (typeof that.options.afterSelect == 'function') {
              that.options.afterSelect.call(this, value, selectedOption.text());
            }
          }
        }
      } else { // Array
        var ms = this;

        for (var cpt = 0; cpt < value.length; cpt++){
          that.select(value[cpt]);
        }
      }
    },
    'deselect' : function(value){
      var that = this,
          ms = this.$element;

      if (typeof value == 'string'){
        var selectableUl = $('#ms-'+ms.attr('id')+' .ms-selectable ul.ms-list'),
            selectionUl = $('#ms-'+ms.attr('id')+' .ms-selection ul.ms-list'),
            selectedOption = ms.find('option[value="'+value +'"]'),
            selectedLi = selectionUl.find('li[ms-value="'+value+'"]');

      if (selectedLi){
          selectionUl.focusin();
          var selectableLi = selectableUl.find('li[ms-value="'+value+'"]');

          var selectableOptgroup = selectableLi.parent('.ms-optgroup');
          if (selectableOptgroup.length > 0){
            selectableOptgroup.children('.ms-optgroup-label').show();
            selectableOptgroup.children('.ms-elem-selectable:not(.ms-selected)').show();
          }

          selectedOption.prop('selected', false);
          selectableLi.removeClass('ms-selected').show();
          selectedLi.removeClass('ms-selected').hide();

          var selectionOptgroup = selectedLi.parent('.ms-optgroup');

          if (selectionOptgroup.children('.ms-selected').length == 0){
            selectionOptgroup.children('.ms-optgroup-label').hide();
          }

          ms.trigger('change');

          if (typeof that.options.afterDeselect == 'function') {
            that.options.afterDeselect.call(this, value, selectedLi.text());
          }
        }
      } else { // Array
        var ms = this;

        for (var cpt = 0; cpt < value.length; cpt++){
          that.deselect(value[cpt]);
        }
      }
    },
    'select_all' : function(){
      var ms = this.$element,
          selectableUl = $('#ms-'+ms.attr('id')+' .ms-selectable ul.ms-list'),
          selectionUl = $('#ms-'+ms.attr('id')+' .ms-selection ul.ms-list');

      ms.find('option').prop('selected', true);
      selectableUl.find('.ms-elem-selectable').addClass('ms-selected').hide();
      selectionUl.find('.ms-optgroup-label').show();
      selectableUl.find('.ms-optgroup-label').hide();
      selectionUl.find('.ms-elem-selection').addClass('ms-selected').show();
    },
    'deselect_all' : function(){
      var ms = this.$element,
          selectableUl = $('#ms-'+ms.attr('id')+' .ms-selectable ul'),
          selectionUl = $('#ms-'+ms.attr('id')+' .ms-selection ul');

      ms.find('option').prop('selected', false);
      selectableUl.find('.ms-elem-selectable').removeClass('ms-selected').show();
      selectionUl.find('.ms-optgroup-label').hide();
      selectableUl.find('.ms-optgroup-label').show();
      selectionUl.find('.ms-elem-selection').removeClass('ms-selected').hide();
    }
  }

  /* MULTISELECT PLUGIN DEFINITION
   * ======================= */

  $.fn.multiSelect = function () {
    var option = arguments[0],
        args = arguments;
    
    return this.each(function () {
      var $this = $(this),
          options = $.extend({}, $.fn.multiSelect.defaults, $this.data(), typeof option == 'object' && option),
          data = new MultiSelect(this, options);
    

      if (typeof option == 'string'){
        data[option](args[1])
      }
    })
  }

  $.fn.multiSelect.defaults = {
    disabledClass : 'disabled',
    dblClick : false
  }

  $.fn.multiSelect.Constructor = MultiSelect

}(window.jQuery);