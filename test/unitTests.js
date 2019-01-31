export var limitFrom = null; // set as number to run only one test
export var limitTo   = null; // set as numer to run range of tests
export var showRows  = false;     // set as true to show results in full rows

export var tests = [
  {
    name: "exclude() illegal tag",
    in: "<custom-tag>custom tag <b><b>content</b></b></custom-tag>",
    out: "custom tag <b>content</b>"
  },
  {
    name: "exclude() with attrs",
    in: "<custom-tag id='foo'>custom content</custom-tag>",
    out: "custom content"
  },
  {
    name: "exclude() with hierarchy wrap",
    in: "<i><custom><b>foo</b></custom></i>",
    out: "<b><i>foo</i></b>"
  },
  {
    name: "Whitespace: inside & enter",
    in: "<div>before<i>\ninside  </i>after</div>",
    out: "<div>before <i>inside</i> after</div>"
  },
  {
    name: "Whitespace: siblings & root",
    in: "<div><b>bar </b><b><i> baz </i></b><b>qux</b></div>",
    out: "<div><b>bar</b> <b><i>baz</i></b> <b>qux</b></div>"
  },
  {
    name: "Whitespace: root",
    in: "<b><i> foo</i></b>",
    out: " <b><i>foo</i></b>"
  },
  {
    name: "Whitespace & exclude",
    in: "<div><i>bar </i><exc>quux </exc></div>",
    out: "<div><i>bar</i> quux </div>"
  },
  {
    name: "Whitespace & empty",
    in: "<p>foo<b> </b>bar</p>",
    out: "<p>foo bar</p>"
  },
  {
    name: "Whitespace & block tags",
    in: "<p><i> baz </i></p>",
    out: "<p> <i>baz</i> </p>"
  },
  {
    name: "Empty with attribute (not removed)",
    in: '<p>foo<b class="some_styling"> </b>bar</p>',
    out: '<p>foo <b class="some_styling"></b>bar</p>'
  },
  {
    name: "Non-breaking space",
    in: "<p>&nbsp;</p>",
    out: "<p>&nbsp;</p>"
  },
  {
    name: "next() merge",
    in: "<b>foo</b><b>bar</b>",
    out: "<b>foobar</b>"
  },
  {
    name: "next() merge with",
    opt: { spaceMerge: true },
    in: "<b>prior </b><b>should combine</b>",
    out: "<b>prior should combine</b>"
  },
  {
    name: "next() with text node and",
    opt: { spaceMerge: true },
    in: "<b>hi</b> <i><b>yay!</b></i>",
    out: "<b>hi <i>yay!</i></b>"
  },
  {
    name: "next(): non merging tags",
    in: "<p>foo</p><p>bar</p>",
    out: "<p>foo</p><p>bar</p>"
  },
  {
    name: "next(): attribute mismatch don't merge",
    in: '<i class="a">foo</i><i class="b">bar</i>',
    out: '<i class="a">foo</i><i class="b">bar</i>'
  },
  {
    name: "parentOrderWrap() with space",
    in: "<i><b> second </b></i>",
    out: " <b><i>second</i></b> "
  },
  {
    name: "parentOrderWrap() & merge with",
    opt: { spaceMerge: true },
    in: "<b><i>first</i></b>\n<i><b> second </b></i>\n<b><i>third</i></b>",
    out: "<b><i>first second third</i></b>"
  },
  {
    name: "Convert",
    in: '<strong id="b">foo</strong><strike class="s">daa</strike>',
    out: '<b id="b">foo</b><s class="s">daa</s>'
  },
  {
    name: "Attributes: order",
    in: "<a id='foo' class='daa' href='to' invalid='foo'>link</a>",
    out: '<a class="daa" href="to" id="foo">link</a>'
  },
  {
    name: "Attributes: exclude & extra space",
    in: '<a class="daa" href="to"   id="foo" invalid="foo">link</a>',
    out: '<a class="daa" href="to" id="foo">link</a>'
  },
  {
    name: "Handle root element",
    in: "<div invalid='foo'>foo</div>",
    out: '<div>foo</div>'
  },
  {
    name: "Handle child element",
    in: "<div><div invalid='foo'>foo</div></div>",
    out: '<div><div>foo</div></div>'
  },
  {
    name: "Deep hierarchy",
    in: "<p><div><a><p>foo</p></a></div></p>",
    out: "<div><p><a>foo</a></p></div>"
  },
  {
    name: "Lookahead rule",
    in: "<b>lookahead</b><span><b>lookahead</b></span>",
    out: "<b>lookahead<span>lookahead</span></b>"
  },
  {
    name: "Empty tag",
    in: "<br>foo</br>",
    out: "<br>foo<br>"
  }
];