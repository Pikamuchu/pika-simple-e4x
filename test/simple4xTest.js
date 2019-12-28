'use strict';

var sinon = require('sinon');
var assert = require('chai').assert;
var XML = require('../lib');

describe('Simple E4X tests', function() {
  describe('Xml parse tests', function() {
    it('Parse div xml anonymous call', function() {
      var testDiv = '<div>test</div>';
      var div = require('../lib').call({}, testDiv);
      assert.isDefined(div);
      assert.equal(div.toString(), testDiv);
    });

    it('Parse person xml', function() {
      var languageArrayXml =
        '<languages>\n' +
        '  <language>JavaScript</language>\n' +
        '  <language>Python</language>\n' +
        '</languages>';
      var personXml =
        '<person>\n' +
        '  <name>Bob Smith</name>\n' +
        '  <likes>\n' +
        '    <os>Linux</os>\n' +
        '    <browser>Firefox</browser>\n' +
        '    <language>JavaScript</language>\n' +
        '    <language>Python</language>\n' +
        '  </likes>\n' +
        '</person>';

      var person = new XML(personXml);

      assert.isDefined(person);
      assert.equal(person.name, 'Bob Smith');
      assert.equal(person['name'], 'Bob Smith');
      assert.equal(person[0].name, 'Bob Smith');
      assert.equal(person.likes[0].os, 'Linux');
      assert.equal(person.likes.browser, 'Firefox');
      assert.equal(person['likes'].browser, 'Firefox');
      assert.equal(person.toString(), personXml);
      assert.equal(person.toXMLString(), personXml);
      assert.equal(person[0].toXMLString(), personXml);
      assert.equal(typeof person.valueOf(), 'object');
      assert.equal(person.likes.language.toXMLString(), languageArrayXml);
      assert.equal(person.likes.language.toString(), languageArrayXml);
    });

    it('Parse instructions xml', function() {
      var stepArrayXml =
      '<steps>\n' +
      '  <step>\n' +
      '    <title status="draft">Step 1</title>\n' +
      '    <para>Think !</para>\n' +
      '  </step>\n' +
      '  <step id="s2">\n' +
      '    <title>Step 2</title>\n' +
      '  </step>\n' +
      '  <step id="s3">\n' +
      '    <title>Step 3</title>\n' +
      '    <para>That was easy !</para>\n' +
      '  </step>\n' +
      '</steps>';
      var stepsXml =
        '<steps>\n' +
        '  <title>List of steps</title>\n' +
        '  <step>\n' +
        '    <title status="draft">Step 1</title>\n' +
        '    <para>Think !</para>\n' +
        '  </step>\n' +
        '  <step id="s2">\n' +
        '    <title>Step 2</title>\n' +
        '  </step>\n' +
        '  <step id="s3">\n' +
        '    <title>Step 3</title>\n' +
        '    <para>That was easy !</para>\n' +
        '  </step>\n' +
        '</steps>';
      var instructionsXml =
        '<stepbystep>\n' +
        '  <doctitle>Sample document</doctitle>\n' +
        '  <info>\n' +
        '    <para>\n' +
        '      See <a href="http://edutechwiki.unige.ch/en/ECMAscript_for_XML" name="hot_link">ECMAscript for XML</a>\n' +
        '    </para>\n' +
        '  </info>\n' +
        stepsXml +
        '</stepbystep>';

      var instructions = new XML(instructionsXml);

      assert.isDefined(instructions);
      assert.equal(instructions.doctitle, 'Sample document');
      assert.equal(instructions.info.para, '\n      See \n    ');
      assert.equal(instructions.steps.step.length(), 3);
      assert.equal(instructions.steps.step[0].title.attribute('status'), 'draft');
      assert.equal(instructions.steps.toString(), stepsXml);
      assert.equal(instructions.steps.toXMLString(), stepsXml);
      assert.equal(instructions.steps.step.toString(), stepArrayXml);
      assert.equal(typeof instructions.steps.step.valueOf(), 'object');
    });
  });

  describe('XML manipulation tests', function() {
    it('Using appendChild', function() {
      var element1 = new XML(
        '<foo>\n' +
        '  <bar/>\n' +
        '</foo>'
      );
      var element2 = new XML('<baz/>');
      element1.bar.appendChild(element2);
      element1["bar"].appendChild('<quux/>');
      assert.equal(
        element1.toXMLString(),
        '<foo>\n' +
        '  <bar>\n' +
        '    \n' +
        '    <baz/>\n' +
        '    <quux/>\n' +
        '  </bar>\n' +
        '</foo>'
      );
    });

    it('Using appendChild', function() {
      var sales = new XML(
        '<sales vendor="John">\n' +
        '  <item type="peas" price="4" quantity="6"/>\n' +
        '  <item type="carrot" price="3" quantity="10"/>\n' +
        '  <item type="chips" price="5" quantity="3"/>\n' +
        '</sales>'
      );

      sales.item.appendChild('<item type="oranges" price="4"/>');
      sales.item[3].set('@quantity', 4);

      assert.equal(sales.get('@vendor'), 'John');
      assert.equal(sales.item.get('@type'), 'peascarrotchipsoranges');
      // TODO: implement xml queries
      //sales.item.set('(@type == "oranges").@quantity', 4);
      //assert.equal(sales.item.get('(@type == "carrot").@quantity'), '10');
      //sales.get('..@price').forEach(function (price) {
      //  assert.isNumber(price);
      //});
      assert.equal(sales.name(), 'sales');
      assert.equal(
        sales.toXMLString(),
        '<sales vendor="John">\n' +
        '  <item type="peas" price="4" quantity="6"/>\n' +
        '  <item type="carrot" price="3" quantity="10"/>\n' +
        '  <item type="chips" price="5" quantity="3"/>\n' +
        '  <item type="oranges" price="4" quantity="4"/>\n' +
        '</sales>'
      );
    });
  });

  describe('Html parse tests', function() {
    it('Parse simple html', function() {
      var htmlString =
        '<div class="grid">\n' +
        '  <header>header</header>\n' +

        '  <article>\n' +
        '    greeting\n' +
        '  </article>\n' +

        '  <footer>footer</footer>\n' +
        '</div>';
      var html = new XML(htmlString);
      assert.equal(html.toString(), htmlString);
    });
  });

  describe('Bugfix tests', function() {
    it('Array templating fix', function() {
      var xmlString = '<sales vendor="John"><item type="peas" price="4" quantity="6"/>,<item type="carrot" price="4" quantity="6"/>,<item type="chips" price="4" quantity="6"/></sales>';
      var xml = new XML(xmlString);
      assert.equal(xml.item.length(), 3);
    });
  });
});
