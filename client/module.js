import inherits from 'inherits';

import CamundaPropertiesProvider from
  'bpmn-js-properties-panel/lib/provider/camunda/CamundaPropertiesProvider';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import entryFactory from 'bpmn-js-properties-panel/lib/factory/EntryFactory';

import fontawesome from "@fortawesome/fontawesome";
import fasArrowDown from "@fortawesome/fontawesome-free-solid/faArrowDown";
import fasArrowLeft from "@fortawesome/fontawesome-free-solid/faArrowLeft";
import fasArrowRight from "@fortawesome/fontawesome-free-solid/faArrowRight";
import fasArrowUp from "@fortawesome/fontawesome-free-solid/faArrowUp";
import fasDotCircle from "@fortawesome/fontawesome-free-solid/faDotCircle";
 
fontawesome.library.add(fasArrowDown, fasArrowLeft, fasArrowRight, fasArrowUp, fasDotCircle);

import template from './template.html';

import {
  classes as domClasses,
  domify,
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

var reference = 'mid-mid';

function getPosition(element) {
  var references = reference.split('-'),
      verticalReference = references[0],
      horizontalReference = references[1];

  var position = {
    x: element.x,
    y: element.y
  };

  if (horizontalReference === 'mid') {
    position.x += element.width / 2;
  } else if (horizontalReference === 'right') {
    position.x += element.width;
  }

  if (verticalReference === 'mid') {
    position.y += element.height / 2;
  } else if (verticalReference === 'bottom') {
    position.y += element.height;
  }

  return position;
}

function referenceProps(group, element, eventBus) {
  var $html = domify(template);

  var $active = domQuery('[data-reference="' + reference + '"]', $html);

  domClasses($active).add('active');

  var $references = Array.prototype.slice.call(domQueryAll('.set-position-reference', $html));

  $references.forEach(function($reference) {
    $reference.addEventListener('click', function() {
      reference = $reference.dataset.reference;

      $references.forEach(function($reference) {
        if ($reference.dataset.reference === reference) {
          domClasses($reference).add('active');
        } else {
          domClasses($reference).remove('active');
        }
      });

      eventBus.fire('elements.changed', {
        elements: [
          element
        ]
      })
    });
  });

  group.entries.push({
    id: 'reference',
    label: 'Reference',
    html: $html,
    get() {

    },
    set() {

    },
    cssClasses: []
  })
}

function positionProps(group, element) {
  group.entries.push(entryFactory.validationAwareTextField({
    id: 'x',
    label : 'x',
    modelProperty: 'x',
    getProperty: function(element, node) {
      return getPosition(element).x.toString();
    },
    setProperty: function(element, values, node) {
      var x = values.x;

      if (isNaN(parseInt(x))) {
        return;
      }

      return {
        cmd: 'elements.move',
        context: {
          shapes: [ element ],
          delta:  {
            x: parseInt(x) - getPosition(element).x,
            y: 0
          },
          hints: {}
        }
      };
    },
    validate: function(element, values) {
      var x = values.x;

      return isNaN(parseInt(x)) ? { x: 'Must be an integer.' } : {};
    },
    buttonShow: {
      method: function() {
        
        // hide clear button
        return false;
      }
    }
  }));

  group.entries.push(entryFactory.validationAwareTextField({
    id: 'y',
    label : 'y',
    modelProperty: 'y',
    getProperty: function(element, node) {
      return getPosition(element).y.toString();
    },
    setProperty: function(element, values, node) {
      var y = values.y;

      if (isNaN(parseInt(y))) {
        return;
      }

      return {
        cmd: 'elements.move',
        context: {
          shapes: [ element ],
          delta:  {
            x: 0,
            y: parseInt(y) - getPosition(element).y
          },
          hints: {}
        }
      };
    },
    validate: function(element, values) {
      var y = values.y;

      return isNaN(parseInt(y)) ? { y: 'Must be an integer.' } : {};
    },
    buttonShow: {
      method: function() {
        
        // hide clear button
        return false;
      }
    }
  }));
}

function createPositionTabGroups(element, eventBus) {

  var referenceGroup = {
    id: 'reference',
    label: 'Reference',
    entries: []
  };

  referenceProps(referenceGroup, element, eventBus);

  var positionGroup = {
    id: 'position',
    label: 'Position',
    entries: []
  };

  positionProps(positionGroup, element);

  return [
    referenceGroup,
    positionGroup
  ];
}

function PositionPropertiesProvider(
  eventBus,
  bpmnFactory,
  elementRegistry,
  elementTemplates,
  translate
) {

  CamundaPropertiesProvider.call(
    this,
    eventBus,
    bpmnFactory,
    elementRegistry,
    elementTemplates,
    translate
  );

  var originalGetTabs = this.getTabs.bind(this);

  this.getTabs = function(element) {

    var tabs = originalGetTabs(element);

    if (!isRootElement(element) && !isConnection(element) && !is(element, 'bpmn:Lane')) {
      var positionTab = {
        id: 'position',
        label: 'Position',
        groups: createPositionTabGroups(element, eventBus)
      };

      tabs = tabs.slice(0, 1).concat(positionTab).concat(tabs.slice(1));
    }

    return tabs;
  };
}

inherits(PositionPropertiesProvider, CamundaPropertiesProvider);

PositionPropertiesProvider.$inject = [
  'eventBus',
  'bpmnFactory',
  'elementRegistry',
  'elementTemplates',
  'translate'
];

export default {
  __init__: [ 'propertiesProvider' ],
  alignToOrigin: [ 'value', null ],
  propertiesProvider: [ 'type', PositionPropertiesProvider ]
};

// helpers //////////

function isConnection(element) {
  return !!element.waypoints;
}

function isRootElement(element) {
  return !element.parent;
}