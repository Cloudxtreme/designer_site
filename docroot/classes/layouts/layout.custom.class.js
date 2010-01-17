/*
 * Material Experience - Card Layout Engines Class
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 */

Card.Layout.Custom = Class.create();
Object.extend(Object.extend(Card.Layout.Custom.prototype, Card.Layout.prototype), 
{
	/*
	 * Initialize the layout class
	 */
	initialize: function(cframe, data, card) 
	{
		this.cframe       = cframe;
		this.data         = data;
		this.card         = card;
		this.color        = this.card.options.color;
		this.hasResources = false;
		this.inited       = false;
	},
	
	/*
	 * Create custom scroll bars for an HTML element.
	 */
	scrollify: function(div, isiframe)
	{
		var div2 = null;
		
		// Inherit the color from a link
		var color = $$('ul#navigation li a')[0].getStyle('background-color');

		if (isiframe)
		{
			div2 = div.contentWindow.document.documentElement;
		}
		else
		{
			div2 = div;
		}

		// Create the scroll container and draggable widget
		this.cframe.appendChild(
			this.scrollCont = Builder.node('div', 
			{ 
				style: 'border-left: 1px solid ' + color + ';' +
					'width: 1px; position: absolute; ' +
					'height:' + div.offsetHeight + 'px; ' +
					'top: 10px;' + 'left: ' + (div.offsetLeft + div.offsetWidth + 12) + 'px;'
			},
			
			this.scrollBar  = Builder.node('img', 
			{ 
				src: 'http://materialexperience.santoprene.com/images/pill.gif', 
				style: 'display: block; margin-left: -3px; cursor: move; ' +
					'background: ' + color + '; padding: 0px;' 
			})
		));
	
		// Create the scroller
		this.scroller = new Control.Slider(this.scrollBar, this.scrollCont, 
		{
			axis: 'vertical',
			range: $R(0, div2.scrollHeight),
					
			onSlide: function(value) 
			{
				div2.scrollTop = Math.floor(value);
			}.bind(this)
		});
		
		new PeriodicalExecuter(function() 
		{
			// Hide the scroller if there isn't a need for it
			if (div2.scrollHeight > 480)
			{
				this.scrollCont.show();
			}
			else
			{
				this.scrollCont.hide();
				return;
			}
		
			// Update the scroller range when the contents change
			this.scroller.range = $R(0, div2.scrollHeight);
	
			// Move the scroller when the scrolled element changes
			// (e.g. linking down into the page).
			if (this.scroller.value != div2.scrollTop)
			{
				this.scroller.setValue(div2.scrollTop);
			}
		}.bind(this), 1);
	},	
	
	initIframe: function(url)
	{
		$('wideCol').innerHTML = '<iframe '                             + 
						'src         = "' + url + '" '  + 
						'frameborder = "0" '            +
						'scrolling   = "auto" '         +
						'width       = "660" '          +
						'height      = "460" '          +
						'id          = "wide_content" ' +
						'name        = "wide_content" ' +
					'></iframe>';
	},
		
	/*
	 * Main function to layout the card.
	 */
	layout: function() 
	{	
		var htmlstr = '<div id="narrowCol" style="float: left; margin: 10px 0px 0px 20px; width: 200px; height: 460px; overflow: hidden;"><ul id="navigation">';
		
		this.data.contentNarrow.each(function(item)
		{		
			htmlstr += '<li><a target="wide_content" href="' + item.url + '">' + item.title  + '</a>';
			
			if (item.subitems)
			{
				var parentUrl = item.url;
				
				htmlstr += '<ul>';
				
				item.subitems.each(function(subitem)
				{
					htmlstr += '<li><a target="wide_content" href="' + parentUrl + '#' + subitem.url + '">' + subitem.title  + '</a></li>';
				}.bind(this));
				
				htmlstr += '</ul></li>';
			}
			else
			{
				htmlstr += '</li>';
			}
		}.bind(this));
		
		htmlstr += '</ul></div><div id="wideCol" style="width: 660px; height: 460px; float: right; margin: 10px 10px 0px 0px;"></div>';
		this.cframe.innerHTML = htmlstr;

		if (this.data.intro)
		{
			$('wideCol').innerHTML = this.data.intro;
		}

//		this.scrollify($('wide_content'), true);
		this.scrollify($('narrowCol'));
		
		// Hide everything first
		$$('ul#navigation li ul').each(function(item) 
		{
			item.setStyle({ display: 'none' });
		});
		
		var curr = null;
		// Then attach the onclick events
		$$('ul#navigation li').each(function(item) 
		{
			Event.observe(item, 'click', function(event) 
			{
				// Hide the currently opened item if it is clicked again
				// per BS.
				if (curr && item == curr)
				{
					curr.down('ul').hide();
					item.setStyle({ borderLeft: '0px' });
					curr = null;
					return;
				}
				
				curr = item;
				
				// Hide everything
				$$('ul#navigation li ul').each(function(item) 
				{
					item.setStyle({ display: 'none' });
				});
				
				// Clear out the borders
				$$('ul#navigation li').each(function(item) 
				{
					item.setStyle({ borderLeft: '' });
				});
				
				// Figure out what color we SHOULD be, this will change
				// depending on the card  color we are on so just rely
				// on the designer to communicate through the CSS,
				// probably not wise relying on a designer for code
				// but alas...
				var color = $$('ul#navigation li a')[0].getStyle('background-color');
				
				this.initIframe(item.href);
				
				// Catch and execute or just leave it lie
				try 
				{
					if (item.down('ul').style.display != 'none')
					{
						item.down('ul').hide();
						Event.stop(event);
						return;
					}
					
					item.down('ul').show();
					item.setStyle({ borderLeft: '3px solid ' + color });
					//Event.stop(event);
				} 
				catch (e) 
				{
					// Just let the link do its thing
				}
			}.bind(this));
		}.bind(this));
	}
});