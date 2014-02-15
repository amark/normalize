$(function(){
	describe('All',function(){
		it('yes',function(){
			var t = $('#htmls').children('div'), prev;
			t.each(function(i){
				if(prev){
					prev = $(prev).clone(true,true);
					normalize(prev);
					expect(prev.html()).to.be($(this).html());
					prev = null;
				} else {
					prev = this;
				}
			});
		});
	});
	mocha.run();
});