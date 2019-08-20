import inherits from 'inherits';

import CamundaPropertiesProvider from
  'bpmn-js-properties-panel/lib/provider/camunda/CamundaPropertiesProvider';

import { is } from 'bpmn-js/lib/util/ModelUtil';

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

import {
  filter,
  forEach
} from 'min-dash';

import {
  clear as svgClear
} from 'tiny-svg';

import {
  translate
} from 'diagram-js/lib/util/SvgTransformUtil';

var reference = 'mid-mid';

var dragger;

var target = null;

var MARKER_NEW_PARENT = 'new-parent',
    MARKER_NOT_OK = 'drop-not-ok';

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

function getTopRight(x, y, width, height) {
  var references = reference.split('-'),
      verticalReference = references[0],
      horizontalReference = references[1];

  if (horizontalReference === 'mid') {
    x = x - width / 2;
  } else if (horizontalReference === 'right') {
    x = x - width;
  }

  if (verticalReference === 'mid') {
    y = y - height / 2;
  } else if (verticalReference === 'bottom') {
    y = y - height;
  }
  
  return {
    x: x,
    y: y
  };
}

function getMid(x, y, width, height) {
  var references = reference.split('-'),
      verticalReference = references[0],
      horizontalReference = references[1];

  if (horizontalReference === 'left') {
    x = x + width / 2;
  } else if (horizontalReference === 'right') {
    x = x - width / 2;
  }

  if (verticalReference === 'top') {
    y = y + height / 2;
  } else if (verticalReference === 'bottom') {
    y = y - height / 2;
  }
  
  return {
    x: x,
    y: y
  };
}

function getChildren(elements) {

  // find elements that are not parent of any other elements
  return filter(elements, function(element) {
    return !find(elements, function(e) {
      return e !== element && getParent(e, element);
    });
  });
}

function getTargetAtPosition(element, position, canvas, elementRegistry) {
  var elements = elementRegistry.filter(function(e) {
    return position.x >= e.x &&
      position.x <= e.x + e.width &&
      position.y >= e.y &&
      position.y <= e.y + e.height &&
      e !== element;
  });

  elements = getChildren(elements);

  return elements.length ? elements.shift() : canvas.getRootElement();
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

function positionEntry(element, axis, injector) {
  var canvas = injector.get('canvas'),
      elementRegistry = injector.get('elementRegistry'),
      eventBus = injector.get('eventBus'),
      modeling = injector.get('modeling'),
      previewSupport = injector.get('previewSupport'),
      rules = injector.get('rules');

  function setPosition(value) {
    var delta = {
      x: 0,
      y: 0
    };

    delta[ axis ] = value - getPosition(element)[ axis ];

    modeling.moveShape(element, delta, target);
  }

  function setMarker(element, marker) {
    forEach([ MARKER_NEW_PARENT, MARKER_NOT_OK ], function(m) {
  
      if (m === marker) {
        canvas.addMarker(element, m);
      } else {
        canvas.removeMarker(element, m);
      }
    });
  }

  function removeMarkers(element) {
    forEach([ MARKER_NEW_PARENT, MARKER_NOT_OK ], function(m) {
      canvas.removeMarker(element, m);
    });
  }

  var $html = domify(
    '<label>' + axis + '</label>' +
    '<div class="bpp-field-wrapper">' +
      '<input class="set-position-input" type="number" value="' + getPosition(element)[ axis ] + '" />' +
    '</div>'
  );

  var $input = domQuery('.set-position-input', $html);

  $input.addEventListener('keydown', function(event) {
    if (event.key !== 'Enter') {
      return;
    }

    var value = parseInt(event.target.value);

    if (isNaN(value)) {
      return;
    }

    setPosition(value);
  });

  $input.addEventListener('input', function(event) {
    var value = parseInt(event.target.value);

    if (isNaN(value)) {
      return;
    }

    if (!dragger) {
      dragger = previewSupport.addDragger(element, canvas.getLayer('set-position-preview'));
    }

    var position = getPosition(element);

    position[ axis ] = value;

    var newTarget = getTargetAtPosition(element,
      getMid(position.x, position.y, element.width, element.height), canvas, elementRegistry);

    if (target && target !== newTarget) {
      removeMarkers(target);
    }

    target = newTarget;

    var canExecute;

    if (target) {
      var canExecute = rules.allowed('elements.move', {
        shapes: [ element ],
        target: target
      });

      // add marker
      if (canExecute) {
        setMarker(target, MARKER_NEW_PARENT);
      } else {
        setMarker(target, MARKER_NOT_OK);
      }
    }

    position = getTopRight(position.x, position.y, element.width, element.height);

    translate(dragger, position.x, position.y);
  });

  function clear() {
    svgClear(canvas.getLayer('set-position-preview'));

    dragger = null;

    target && removeMarkers(target);

    target = null;

    $input.value = getPosition(element)[ axis ].toString();
  }

  $input.addEventListener('blur', clear);

  eventBus.on('elements.changed', clear);

  return {
    id: axis,
    html: $html
  }
}

function positionProps(group, element, injector) {
  group.entries.push(positionEntry(element, 'x', injector));
  group.entries.push(positionEntry(element, 'y', injector));
}

function createPositionTabGroups(element, eventBus, injector) {

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

  positionProps(positionGroup, element, injector);

  return [
    referenceGroup,
    positionGroup
  ];
}

function PositionPropertiesProvider(eventBus, injector) {
  injector.invoke(CamundaPropertiesProvider, this);

  var originalGetTabs = this.getTabs.bind(this);

  this.getTabs = function(element) {

    var tabs = originalGetTabs(element);

    if (!isRootElement(element) && !isConnection(element) && !is(element, 'bpmn:Lane')) {
      var positionTab = {
        id: 'position',
        label: 'Position',
        groups: createPositionTabGroups(element, eventBus, injector)
      };

      tabs = tabs.slice(0, 1).concat(positionTab).concat(tabs.slice(1));
    }

    return tabs;
  };
}

inherits(PositionPropertiesProvider, CamundaPropertiesProvider);

PositionPropertiesProvider.$inject = [
  'eventBus',
  'injector'
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