/*
 * Material Experience - 2 Column Custom Content Script
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 10/21/07
 */

// Tracks the last ID requested
var lastID = null;

// Track the currently open nav item
var curr = null;

document.write('<script type="text/javascript" src="http://materialexperience.santoprene.com/lib/scriptaculous/scriptaculous.js"></script>');

function doLoad() 
{
	// Hide everything first
	$$('ul#navigation li ul').each(function(item) 
	{
		item.setStyle({ display: 'none' });
	});
	
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
				Event.stop(event);
			} 
			catch (e) 
			{
				// Just let the link do its thing
			}
		});
	});
}

function locateContent(contID)
{
	// Hide the last ID from a global variable because going over each
	// item and hiding it could take a prohibitively long time on a big
	// page and we will most definitely be dealing with big pages here.
	if (lastID)
	{
		$(lastID).className = "";
	}
	
	// Track the requested content ID
	lastID = contID;
	
	// The scroll top but subtract the height of the item itself or we
	// always scroll to the bottom of items.
	$('test').scrollTop = $(contID).offsetTop - $(contID).getHeight();
	$(contID).className = "selected";
}

/*
 * Create custom scroll bars for an HTML element.
 */
function scrollify(div)
{
	// Inherit the color from a link
	var color = $$('ul#navigation li a')[0].getStyle('background-color');

	// Create the scroll container and draggable widget
	document.body.appendChild(
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
		range: $R(0, div.scrollHeight),
				
		onSlide: function(value) 
		{
			div.scrollTop = Math.floor(value);
		}.bind(this)
	});
	
	new PeriodicalExecuter(function() 
	{
		// Update the scroller range when the contents change
		this.scroller.range = $R(0, div.scrollHeight);

		// Move the scroller when the scrolled element changes
		// (e.g. linking down into the page).
		if (this.scroller.value != div.scrollTop)
		{
			this.scroller.setValue(div.scrollTop);
		}
	}.bind(this), 1);
}

/*
 * Attach scrollbars to the narrow column and the wide column if they exist.
 */
Event.observe(window, 'load', function()
{
	if ($$('.narrowCol')[0])
	{
		new scrollify($$('.narrowCol')[0]);
	}
	
	if ($$('.wideCol')[0])
	{
		new scrollify($$('.wideCol')[0]);
	}
});

Event.observe(window, 'load', doLoad);