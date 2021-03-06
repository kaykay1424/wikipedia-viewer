/*
	Explanation of program:
	
    When a user clicks on one of the buttons in the form, an article(s) will be displayed below
    the form by making an ajax call to wikipedia api. When a user enters an article keyword(s),
    chooses the number of articles they wish to see displayed, and clicks the default search button,
    the specified number of Wikipedia articles pertaining to the article keyword(s) will be displayed
    below the form (if they choose no number of articles, the default number of 10 will be used). If
    the lucky button is clicked only 1 article pertaining to the article keyword(s) will be
    displayed. If the random button is clicked, one random article will be displayed regardless of
    article keyword(s). Each article box will show the title and have a max of 3 introductory
    sentences (or 'N/A' if no introductory sentences are available) giving a brief overview of the
    article along with a star button to favorite the article and save it to the browser's local
    storage and a bookmark button to bookmark it and read later (it will not be saved to local
    storage). As articles are added to either category of stored articles, the number of articles in
    that category displayed next to the category name will automatically increase and decrease when
    they are deleted. Clicking on the article title in the article box or in the 'Favorites 'or 'Read
    Later' bars at the bottom of the screen will open that article up in a new page.  
	
	
*/	

$(document).ready(function() {

	$('form')[0].reset();
	
	let popoverOptions = {
	
	    // position popover to top of element or to right of element based on width of window
	
		placement: function () {
		
			let screenWidth = $(window).width();
			
			if (screenWidth < 800) {
			
				return "top";
				
			} 
			
			else {
			
				return "right";
				
			}
			
		} // end of function()
		
	};
	
	$('#searchbox [data-toggle="popover"]').popover(popoverOptions);
	
	$(window).resize(function() {
	
		$('#searchbox [data-toggle="popover"]').popover(popoverOptions);
		
	}); 
	
	$('[data-toggle="popover"]').popover();
	
	let favorites = JSON.parse(localStorage.getItem('favorites'));
	
	if (favorites !== null && favorites.length > 0) {
		
		fetchSavedArticles('favorites');
	
	}

	let bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
	
	if (bookmarks !== null && bookmarks.length > 0) {
		
		fetchSavedArticles('bookmarks');
	
	}
	
	$('#favorites-button').hover(function() {
	
		$('#favorites-button .badge').hide();
		
		$('#favorites-button').append('<span class="caret"></span>');
	    
	    }, function() {
	
		$('#favorites-button .badge').show();
		
		$('#favorites-button .caret').remove();
		
	});
	
	$('#bookmarks-button').hover(function() {
	
		$('#bookmarks-button .badge').hide();
		
		$('#bookmarks-button').append('<span class="caret"></span>');
        
        }, function() {
	
		$('#bookmarks-button .badge').show();
		
		$('#bookmarks-button .caret').remove();
		
	});
	
	$('#search-button').click(defaultSearch);
	
	$('#lucky').click(luckySearch);
	
	$('#random').click(randomSearch);
	
	let favoriteArticleCounter = 0; // counts number of articles added to favorites bar
	
	let bookmarkArticleCounter = 0; // counts number of articles added to read later bar
	
	function randomSearch() {
	
		$('.title-div, #alert-warning').hide(); // no need for alert (shows when no keywords are entered) as search keywords are not taken into account when searching for a random article
		
		$('#search-limit').val(1); // only 1 article will be displayed
		
		$('#search').removeClass('border-red').val(''); // remove this class as alert is only shown when no keywords are entered and keywords are not taken into account when searching for a random article
		
		$.ajax({
		
			url: "https://en.wikipedia.org/w/api.php?action=query&list=random&rnlimit=1&utf8=&format=json", // search for 1 random article
			
			dataType: "jsonp",
			
			success: function(responses) {

				let searchTitle = responses.query.random[0].title;
				
				// get info from 1 random article 
				
				getIntro(searchTitle);
					
			} // end of success()
				
		}); // end of $.ajax()
			
	} // end of randomSearch()
		
	function luckySearch() {
	
		$('.title-div').hide(); // clear results from any previous search
		
		let keyword = $('#search').val();

		if (keyword.length !== 0) {

			$('#alert-warning').hide(); // remove alert when keywords are entered
			
			$('#search-limit').val(1); // only 1 article will be displayed

			$('#search').removeClass('border-red'); // remove this class when keywords are entered
			
		}
		
		else if (keyword.length === 0) {
			
			$('#alert-warning').addClass('animated flash').show(); // show alert when no keywords are entered
			
			$('#search').addClass('border-red'); // show this class when no keywords are entered
			
			$('#search-limit').val(''); // clear search result field as no results will be shown without keywords having been entered
			
			return false;
		}
		
		let titleOfArticle = '';
		
		$.ajax({
		
			url: "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=" + keyword + "&utf8=&format=json", // search for articles pertaining to keyword(s) searched
			
			dataType: "jsonp",
			
			success: function(info) {
			
				let searchArray = info.query.search; // array of articles returned
				
				let storeTitlesArray = []; 
				
				for (let i = 0; i < searchArray.length; i++) {
				
					storeTitlesArray.push(searchArray[i].title);
					
				}
				
				let random = Math.floor((Math.random() * storeTitlesArray.length) + 1); // get a random number between 1 and number of articles returned
				
				// get info from 1 random article based on keyword
				
				getIntro(storeTitlesArray[random]);	

			} // end of success()
			
		}); // end of $.ajax()

	} // end of luckySearch()
	
	function defaultSearch() {
	
		$('.title-div').hide(); // clear results from any previous search
		
		let keyword = $('#search').val();
		
		let searchLimit = $('#search-limit').val();
		
		if (searchLimit.length === 0) {
	
		    searchLimit = 10;
		    
		    if (keyword.length !== 0) {
		        
		        $('#search-limit').val(10); // 10 (default number) articles will be displayed if no number is entered
		    
		    }

		} // end of if (searchLimit.length === 0)
		
		if (keyword.length === 0) {
		    
		    $('#alert-warning').addClass('animated flash').show(); // show alert when no keywords are entered
			
			$('#search').addClass('border-red'); // show this class when no keywords are entered
			
			$('#search-limit').val(''); // clear search result field as no results will be shown without keywords having been entered
			
			return false;
			
		}
		
		else if (keyword.length !== 0) {
			
			$('#alert-warning').hide(); // remove alert when keywords are entered

			$('#search').removeClass('border-red'); // remove this class when keywords are entered
			
		}

		$.ajax({
		
			url: "https://en.wikipedia.org/w/api.php?action=query&list=search&srlimit=" + searchLimit + "&srsearch=" + keyword + "&utf8=&format=json", // search for inputted number (or 10 if no number is entered) of articles pertaining to keyword(s)
			
			dataType: "jsonp",
			
			success: function(info) {
			
				let searchArray = info.query.search; // array of articles returned
				
				let storeTitlesArray = [];
				
				for (let i = 0; i < searchArray.length; i++) {
				
				    storeTitlesArray.push(searchArray[i].title);
				
				}
				
				for (let j = 0; j < storeTitlesArray.length; j++) {
				
					// get info from each article based on keyword
					
					getIntro(storeTitlesArray[j]);	
					
				}
				
			} // end of success()
			
		}); // end of $.ajax()
		
	} // end of defaultSearch()
	
    /* To gather title, excerpt, and url of each article, 2 separate functions are used to
    facilitate querying during ajax calls so that all details can be gathered. */

	function getIntro(title) {
		
		$.ajax({
		
			url: "https://en.wikipedia.org/w/api.php?action=query&prop=extracts&exintro=&explaintext=&exsentences=3&titles=" + title + "&utf8=&format=json", // search for 3 introductory sentences from title gathered from search for articles by keywords
			
			dataType: "jsonp",
			
			success: function(data) {
			
				let articleInfo = data.query.pages; 
				
				let pageId = Object.keys(articleInfo);
				
				let intro = articleInfo[pageId[0]].extract; // 3 introductory sentences of article
				
				getURL(title, intro);
				
			} // end of success()
			
		}); // end of $.ajax
		
	} // end of getIntro()
	
	function getURL(title, intro, pageId) {
	
		$.ajax({
		
			url: "https://en.wikipedia.org/w/api.php?action=query&prop=info&inprop=url&titles=" + title +"&utf8=&format=json" , // search for url of from title gathered from search for articles by keywords
			
			dataType: "jsonp",
			
			success: function(response) {
			
				let articleInfo = response.query.pages;
				
				let pageId = Object.keys(articleInfo);
				
				let fullURL = articleInfo[pageId[0]].fullurl;

				displayArticle(title, intro, fullURL);
		
			} // end of success()
			
		}); // end of $.ajax()
		
	} // end of getURL() 
	
	function displayArticle(title, intro, URL) {
		
		if (intro.length === 0 ) {
			
			intro = 'N/A';
			
		}
		
		$('<div class="title-div"><h3><a href="'+URL+'" target="_blank">' + title + '</a></h3><p><strong>Brief Intro:</strong></p><p>'+ intro + '</p> </div>')
			
			.append(`<i>Favorite article:</i> <span class="glyphicon glyphicon-star"></span> <i>Read article later:</i> <span class="glyphicon glyphicon-bookmark"></span>`)
			
			.on('click', '.glyphicon', function() {
				
				const list = $(this).hasClass('glyphicon-bookmark') ? 'bookmarks': 'favorites';
				 
				saveArticle(title, URL, list);
			
			}).appendTo('#article-list');
	
	} // end of displayArticle()

	}); // end of document ready 
	
	function saveArticle(articleTitle, URL, list) {

		let newArticle = {
		
			title: articleTitle,
			
			url: URL
			
		}
		
		if (localStorage.getItem(list) !== null) {
		
			let articles = JSON.parse(localStorage.getItem(list));
			
			for (let i = 0; i < articles.length; i++) {
			
				let name = articles[i].title;
				
				let url = articles[i].url;

				if (articleTitle === name) {
				
					alert(`This article is already in your ${list}.`);
					
					return false;
					
				}
	
			} // end of for loop

			articles.push(newArticle);
			
			localStorage.setItem(list, JSON.stringify(articles));
			
		} // end of if localStorage.getItem('favorites') !== null
		
		else if (localStorage.getItem(list) === null) {
		
			let articles = [];
			
			articles.push(newArticle);
			
			localStorage.setItem(list, JSON.stringify(articles));
			
		} 
		
		else {
		
			let articles = JSON.parse(localStorage.getItem(list));
			
			articles.push(newArticle);
			
			localStorage.setItem(list, JSON.stringify(articles));
			
		}
		
		fetchSavedArticles(list);

	} // end of saveArticle()
	
	function deleteSavedArticle(url, list) {

		let articles = JSON.parse(localStorage.getItem(list));
		
		let newArticles = [...articles]; 

		for (let i = 0; i < articles.length; i++) {
		
			if (articles[i].url === url) {
			
				newArticles.splice(i,1);

				break;
			
			}
			
		} // end of for loop

		localStorage.setItem(list, JSON.stringify(newArticles));
		
		fetchSavedArticles(list);

	} // end of deleteSavedArticle()
	
	function fetchSavedArticles(list) {
	
		let storageUL = document.getElementById(`${list}-storage-ul`);
		
		storageUL.innerHTML = '';
		
		let articles = JSON.parse(localStorage.getItem(list));
		
		// if there are no more favorites (articles in favorites category)

		if (articles.length < 1) {
		
			$(`#${list}-bar`).hide();
			
		}
		
		// if there are favorites (articles in favorites category)
		
		else {
		
			$(`#${list}-bar`).show();
			
		}
		
		for (let i = 0; i < articles.length; i++) {
		
			let name = articles[i].title;
			
			let url = articles[i].url;

			$(`#${list}-amount`).html(articles.length);
			
			storageUL.innerHTML += `<li class="${list}-li" ><a href="${url}" target="_blank">${name}</a>`; 
			
			list === 'favorites' ? storageUL.innerHTML += ` <span class="glyphicon glyphicon-bookmark"> </span>`: storageUL.innerHTML += ` <span class="glyphicon glyphicon-star"> </span>`
			
			storageUL.innerHTML += ` <span  class="delete-${list} glyphicon glyphicon-remove" > </span></li>`;
	
			$(storageUL).find('.glyphicon-remove').click(function() {

				deleteSavedArticle(url, list)
			
			});

			$(storageUL).find('.glyphicon:not(.glyphicon-remove)').click(function() {
				
				const list = $(this).hasClass('glyphicon-bookmark') ? 'bookmarks': 'favorites';

				saveArticle(name, url, list);
			
			});
		} // end of for loop
		
	} // end of deleteSavedArticle()