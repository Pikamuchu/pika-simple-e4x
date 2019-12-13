'use strict';

var sinon = require('sinon');
var assert = require('chai').assert;
var XML = require('../lib');

describe('Simple E4X tests', function() {
  describe('Simple examples', function() {
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
      assert.equal(person.likes.browser, 'Firefox');
      assert.equal(person['likes'].browser, 'Firefox');
      assert.equal(person.toString(), personXml);
      assert.equal(person.toXMLString(), personXml);
      assert.equal(person.likes.language.toXMLString(), languageArrayXml);
      assert.equal(person.likes.language.toString(), languageArrayXml);
      assert.equal(person.likes.language.valueOf(), languageArrayXml);
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
      assert.equal(instructions.steps.step.valueOf(), stepArrayXml);
    });
  });
});
