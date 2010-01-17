/*
 * Material Experience - Utility Functions
 * 
 * EYEMG - Interactive Media Group
 * Created by Mike Crute (mcrute@eyemg.com)
 * Updated by Mike Crute (mcrute@eyemg.com) on 9/26/07
 * 
 * Various utility functions that do not natively exist in any of
 * the libraries we use.
 * 
 * This is also the zoo for monkey patches. Be careful.
 */

Object.extend(window, 
{
	/*
	 * Calculates the top and left offsets to center an element within the 
	 * page. Every browser seems to approach this in a different fashion but 
	 * this function works well on FX, OP, WK, and IE.
	 */
	calcCordsToCenter: function(height, width) 
	{
		var windowSize = window.getDimensions();

		return { 
			top:  Math.round(((windowSize.height - height) / 2)), 
			left: Math.round(((windowSize.width  - width)  / 2)) 
		};
	},
	
	/*
	 * Gets the dimensions of the current window accounting for variations 
	 * in browsers. Supports IE in either quirks or strict mode.
	 */
	getDimensions: function() 
	{
		var windowSize = { 
			height: document.documentElement.clientHeight,
			width: document.documentElement.clientWidth
		};
	
		if (Prototype.Browser.Opera) 
		{
			windowSize = { 
				height: document.body.clientHeight,
				width: document.body.clientWidth
			};
		}

		if (Prototype.Browser.WebKit) 
		{
			windowSize = { 
				height: window.innerHeight,
				width: window.innerWidth
			};
		}
	
		return windowSize;
	},
	
	/*
	 * Verify the screen size is great than a set minimum or warn the user.
	 * Probably superfluous but why not.
	 */
	checkResolution: function() 
	{
		var size = window.getDimensions();
	
		if (
			size.height < SME.sizes.windMin.height || 
			size.width  < SME.sizes.windMin.width
		) 
		{
			new Bezel({ displayTime: 2 }).show(Strings.windowSize);
			Event.stopObserving(window, 'resize', window.checkResolution);
		}
	}
});

Object.extend(String.prototype, 
{
	/*
	 * Cleans up sloppy Compose JSON output by removing comments, newlines,
	 * and tabs.
	 */
	cleanJSON: function() 
	{
		var data = this;
		data     = data.replace(/^\/\/.*/gm,'');
		data     = data.replace(/(\n|\t|\r)/g,'');
		
		return data;
	}
});

Object.extend(Ajax.Request.prototype, 
{
	/*
	 * Forces  IE to enqueue XHR requests otherwise it gets bogged down and 
	 * freezes the interface.
	 */
	initialize: function(url, options) 
	{
		this.transport = Ajax.getTransport();
		this.setOptions(options);
		this.url = url;
		
		if (Prototype.Browser.IE) 
		{
			Ajax.requestQueue.push(this);
			Ajax._runQueue();
		} 
		else 
		{
			this.request(url);
		}
	},
  
	/*
	 * Monkey patch prototype so it stops auto-evaluating the returned JSON 
	 * data. Our JSON data is simply not clean enough for that and it throws
	 * errors all over the place.
	 *
	 * I've made as few modifications from the original as possible to ease 
	 * in porting forward changes made in Prototype.
	 */
	respondToReadyState: function(readyState) 
	{
		var state     = Ajax.Request.Events[readyState];
		var transport = this.transport;
		
		if (state == 'Complete') 
		{
			try 
			{
				this._complete = true;
				(this.options['on' + this.transport.status]
					|| this.options['on' + (this.success() ? 'Success' : 'Failure')]
					|| Prototype.emptyFunction)(transport);
			} 
			catch (e) 
			{
				this.dispatchException(e);
			}
		}
		
		try 
		{
			(this.options['on' + state] || Prototype.emptyFunction)(transport);
			Ajax.Responders.dispatch('on' + state, this, transport);
		} 
		catch (e) 
		{
			this.dispatchException(e);
		}
		
		if (state == 'Complete') 
		{
			// avoid memory leak in MSIE: clean up
			this.transport.onreadystatechange = Prototype.emptyFunction;
		}
	}
});

/*
 * Implement AJAX request queueing. IE does not handle AJAX request concurrency
 * very well and will freeze the entire browser interface if more than 2 calls 
 * are queued at a single time. We implement a global request queue and a queue 
 * runner that handles concurrent AJAX requests. The code is pretty straight 
 * forward but it also depends on modifications made to Ajax.Request.prototype.
 */
Object.extend(Ajax, 
{
	// Global AJAX Request Queue
	requestQueue: [],
	

	/*
	 * Process events in the request queue.
	 */
	_runQueue: function() 
	{
		if (this.activeRequestCount > 1) 
		{
			// Too many requests so we will try again later
			new PeriodicalExecuter(function(executer) 
			{
				this._runQueue();
				executer.stop();
			}.bind(this), 0.1);
		
			return;
		}
		
		// Run the first request in the queue
		var currentRequest = this.requestQueue.shift();
		currentRequest.request(currentRequest.url);
	}
});