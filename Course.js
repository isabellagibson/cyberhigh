/*
 *	Version History:
 *		[All Previous Versions...]
 *		1.02 - 08/24/2017 
 */

var Course = {

	playAudibleContentFile: function (filename, event) {
		if (event != null) {
			event.stopPropagation();
			event.cancelBubble = true;
		}
		$('#audibleContentAudioSource').attr('src', filename);
		$('#audibleContentPlayer').trigger('load');
		$('.PageAudibleContentPlayer').show(500, 'swing', function () {
			$('#audibleContentPlayer').trigger('play');
		});
	},

	closeAudibleContentPlayer: function () {
		$('#audibleContentPlayer').trigger('pause');
		$('.PageAudibleContentPlayer').hide(500);
	},

	finishedLoading: function () {
    $('.CardSort').each(function () {
      CardSort.initialize($(this));
    });

    $('.WordSort').each(function () {
      WordSort.initialize($(this));
    });

    $('.ImageMap').each(function () {
      ImageMap.initMap($(this).attr('id'));
    });

    $('.Flipbook, .Story').each(function () {
      Flipbook.init($(this));
    });

    $('.Timeline').each(function () {
      Timeline.init($(this));
    });

    if ($('.CalculatorElement').length) {
      CourseViewer.initPageCalculators();
    }

    if ($('.WordGroupsActivity').length) {
      WordGroupsActivity.init();
    }

    if ($('.RetellingActivity').length) {
      RetellingActivity.init();
    }

    if ($('.ReorderParagraphsActivity').length) {
      ReorderParagraphsActivity.init();
    }

    if ($('.SlidingScale').length) {
      SlidingScale.init(false);
    }

    if ($('.TabbedExample').length) {
      TabbedExample.init();
    }

    if ($('.EquationSolver').length) {
      EquationSolver.init();
    }

    if ($('.ImageFlip').length) {
    	ImageFlip.init();
    }

    if ($('.RearrangeSteps').length) {
    	RearrangeSteps.init();
    }

    var composer = Global.getQueryStringValue('composer') === '1';
    var req = Global.getQueryStringValue('req');

    if (!composer && window.location.href.indexOf('CourseViewerPopup.aspx') === -1 && window.location.href.indexOf('CourseViewerReviewPopup.aspx') === -1 && req.indexOf('quiz') === -1 && req.indexOf('activity') === -1 && req.indexOf('practicepage') === -1 && req.indexOf('pbl') === -1) {
      $.contextMenu({
        selector: '.highlighted',
        items: {
          note: {
            name: 'Add Note',
            icon: 'note',
            callback: function (key, opt) { CourseViewer.addHighlightNote(opt.$trigger, false); }
          },
          del: {
            name: 'Remove Highlight & Note',
            icon: 'delete',
            callback: function (key, opt) { CourseViewer.removeHighlight(opt.$trigger); }
          }
        }
      });

      $.contextMenu({
        selector: '.HighlightNote',
        items: {
          view: {
            name: 'View Note',
            icon: 'view',
            callback: function (key, opt) { CourseViewer.viewNote(opt.$trigger); }
          },
          del: {
            name: 'Remove Note',
            icon: 'delete',
            callback: function (key, opt) { CourseViewer.removeHighlightNote(opt.$trigger); }
          }
        }
      });

      $(':not(.FlipbookPage) > .Paragraph').not('.StepByStepElement').textHighlighter({
      	color: '#daf1ff',
			onAfterHighlight: function (highlights, range) {
          CourseViewer.highlightSelection(highlights, range);
        }
      });
    }

    $('.RightButtons').show();
    $('.Quiz').show();
    $('.TextEditorLink').show();

  },

  sendError: function (error, ex) {
    var personId = Global.getQueryStringValue('pid');
    var courseVersionId = Global.getQueryStringValue('courseVersionId');
    var unit = Global.getQueryStringValue('unit');
    var pageType = $('.DivContent').find('.PageContainer,.ActivityContainer,.PracticePageContainer,.QuizContainer,.GlossaryContainer,.BibliographyContainer,.StandardsContainer').attr('type');
    var pageId = '';
    var errorMessage = 'Function Name: ' + error + '\r\nError: ' + ((typeof ex.message === 'undefined') ? ex : ex.message);

    if (pageType === 'page') {
      pageId = $('.DivContent').find('.PageContainer').attr('id').replace('page', '');
    }
    else if (pageType === 'activity') {
      pageId = $('.DivContent').find('.ActivityContainer').attr('id').replace('activity', '');
    }
    else if (pageType === 'practicePage') {
      pageId = $('.DivContent').find('.PracticePageContainer').attr('id').replace('practicePage', '');
    }
    else if (pageType === 'quiz') {
      pageId = $('.DivContent').find('.Quiz').attr('id').replace('quiz', '');
    }
    //Courses.saveCourseError(personId, courseVersionId, unit, pageType, pageId, errorMessage);
  },

  checkKeycode: function (e) {
    var keycode = window.event ? window.event.keyCode : e.which;

    if ($('.Quiz').length > 0) {
      Quiz.checkKeycode(e, keycode);
    }
    else if ($('.Page').length > 0) {
      if (e.ctrlKey && keycode === 88) {
        var div = $('#divGlossary');

        if (div.css('display') !== 'none') {
          var pageId = $('.DivContent').find('.PageContainer').attr('id').replace('page', '');
          var match = $('#lblMatchedText').html();
          var sectionNumber = $('#lblSectionNumber').html();
          var matchInstance = $('#lblMatchInstance').html();

          PageMethods.excludeGlossaryMatch(pageId, match, sectionNumber, matchInstance, Course.glossaryMatchExcluded);
        }
      }
    }
  },

  removeTrailingLineBreaks: function (text) {
    while (text.substring(text.length - 4) === '<br>') {
      text = text.substring(0, text.length - 4);
    }

    return text;
  },

  showAcademicPlus: function () {
  	$('.AcademicPlusElement').show();
  },

  toggleAcademicPlus: function () {
    $('.AcademicPlusElement').toggle();
  },

  toggleChapter: function (btn) {
    btn = $(btn);
    btn.hasClass('Expand') ? btn.removeClass('Expand').addClass('Collapse') : btn.removeClass('Collapse').addClass('Expand');
    btn.parents('.Chapter').next('.ChapterNodes').toggle();
  },

  togglePage: function (btn) {
    btn = $(btn);
    btn.hasClass('Expand') ? btn.removeClass('Expand').addClass('Collapse') : btn.removeClass('Collapse').addClass('Expand');
    var divPage = btn.parents('.NodeCollapsed,.NodeExpanded');
    divPage.find('.PageTemplates').toggle();
    divPage.hasClass('NodeExpanded') ? divPage.removeClass('NodeExpanded').addClass('NodeCollapsed') : divPage.removeClass('NodeCollapsed').addClass('NodeExpanded');
  },

  openUrlWindow: function (popupUrl, target) {
    try {
      var top = ((screen.height / 2) - 350) + 'px';
      var left = ((screen.width / 2) - 500) + 'px';
      window.open(popupUrl, target, 'toolbar=0, location=0, directories=0, status=0, menubar=0, scrollbars=1, resizable=1, width=1000px, height=700px, left=' + left + ', top=' + top);
    }
    catch (ex) {
      Course.sendError('Course.openUrlWindow', ex);
    }
  },

  glossaryMatchExcluded: function (results) {
    alert(results);
    window.location = window.location;
  },

  openGlossary: function (txt, match, sectionNumber, matchInstance, e) {
    try {
      var div = $('#divGlossary');
      var lblWord = $('#lblGlossaryWord');
      var lblType = $('#lblGlossaryType');
      var lblDef = $('#lblGlossaryDefinition');
      var lblMatch = $('#lblMatchedText');
      var lblSectionNumber = $('#lblSectionNumber');
      var lblMatchInstance = $('#lblMatchInstance');
      var Content = $('.CourseContent');

      var defString = eval('key' + txt.replace(/-/g, '').replace(/ /g, '').replace(/\(/g, '').replace(/\)/g, '').replace(/\//g, '').replace(/\'/g, '').replace(/\./g, '').replace(/,/g, ''));
      var defArray = defString.split('||');

      if (defArray.length > 0) {
        lblWord.html(defArray[0]);
      }

      if (defArray.length > 1 && defArray[1].length > 0) {
        lblType.html('(' + defArray[1] + ')');
      }
      else {
        lblType.html('');
      }

      if (defArray.length > 2) {
        lblDef.html(defArray[2]);
      }

      lblMatch.html(match);
      lblSectionNumber.html(sectionNumber);
      lblMatchInstance.html(matchInstance);

      div.css('visibility', 'hidden');
      div.show();

      var x = e.clientX;
      var y = e.clientY;
      x = x > (document.body.clientWidth / 2) ? (x - 340) : (x + 20);
      y = y > (Content.get(0).offsetHeight / 2) ? y - div.get(0).offsetHeight - 20 : y + 20;
      div.css('left', x + 'px');
      div.css('top', y + 'px');

      var iMask = $('#divGlossary_Mask');
      iMask.css('top', (y - 2) + 'px');
      iMask.css('left', (x + 2) + 'px');
      iMask.css('width', '300px');
      iMask.css('height', div.get(0).offsetHeight + 'px');
      div.css('visibility', 'visible');
      iMask.show();;
    }
    catch (ex) {
      alert(ex);
    }
  },

  closeGlossary: function () {
    var div = $('#divGlossary');
    $('#divGlossary_Mask').hide();
    div.css('visibility', 'hidden');
    div.hide();
  },

  openEditor: function () {
    try {
      var popup = new PopupWindowClass();
      var x = (window.screenX ? window.screenX : 0) + (((window.outerWidth ? window.outerWidth : document.body.clientWidth) - 735) / 2);
      var y = (window.screenY ? window.screenY : 0) + (((window.outerHeight ? window.outerHeight : document.body.clientHeight) - 510) / 2);
      var personId = Global.getQueryStringValue('pid');
      var courseVersionId = Global.getQueryStringValue('courseVersionId');
      var unit = Global.getQueryStringValue('unit');
      var url = 'TextEditor.aspx?courseVersionId=' + courseVersionId + '&unit=' + unit + '&person=' + personId;

      popup.url = url;
      popup.name = 'editor';
      popup.width = 735;
      popup.height = 510;
      popup.resizable = false;
      popup.scrollbars = false;
      popup.statusbar = false;
      popup.left = x;
      popup.top = y;

      var win = popup.GetWindowObject();
      win.focus();
    }
    catch (ex) {
      Course.sendError('Course.openEditor', ex);
    }
  },

  openDictionary: function () {
    var popup = new PopupWindowClass();

    var x = (window.screenX ? window.screenX : 0) + (((window.outerWidth ? window.outerWidth : document.body.clientWidth) - 800) / 2);
    var y = (window.screenY ? window.screenY : 0) + (((window.outerHeight ? window.outerHeight : document.body.clientHeight) - 600) / 2);

    popup.url = 'http://www.merriam-webster.com/';
    popup.name = 'Dictionary';
    popup.width = 800;
    popup.height = 600;
    popup.resizable = true;
    popup.scrollbars = true;
    popup.statusbar = true;
    popup.left = x;
    popup.top = y;

    var win = popup.GetWindowObject();
    win.focus();
  },

  openCalculator: function () {
    var popup = new PopupWindowClass();

    var x = (window.screenX ? window.screenX : 0) + (((window.outerWidth ? window.outerWidth : document.body.clientWidth) - 248) / 2);
    var y = (window.screenY ? window.screenY : 0) + (((window.outerHeight ? window.outerHeight : document.body.clientHeight) - 212) / 2);

    popup.url = 'Calculator.html';
    popup.name = 'calc';
    popup.width = 248;
    popup.height = 212;
    popup.resizable = true;
    popup.scrollbars = false;
    popup.statusbar = false;
    popup.left = x;
    popup.top = y;

    var win = popup.GetWindowObject();
    win.focus();
  },

  showCourseTutorial: function () {
    var win = window.open('StudentOrientation/', 'Student Orientation', 'width=1200,height=900,resizable=0,scrollbars=1,status=0');
    win.moveTo(((screen.availWidth / 2) - 600), ((screen.availHeight / 2) - 450));
  },

  openHelpPopup: function (src) {
    var win = window.open(src, 'Cyber High Help', 'width=750,height=563,resizable=1,scrollbars=1');
    win.moveTo(((screen.availWidth / 2) - 375), ((screen.availHeight / 2) - 281.5));
    return false;
  },

  printPage: function (pageUrl) {
    var top = ((screen.height / 2) - 300) + 'px';
    var left = ((screen.width / 2) - 385) + 'px';
    window.open(pageUrl, 'PrintPage', 'toolbar=0, location=0, directories=0, status=0, menubar=0, scrollbars=1, resizable=1, width=770px, height=600px, left=' + left + ', top=' + top);
  },

  openChat: function () {
    var top = ((screen.height / 2) - 200) + 'px';
    var left = ((screen.width / 2) - 250) + 'px';
    window.open('Chat.aspx', 'Chat', 'toolbar=0, location=0, directories=0, status=0, menubar=0, scrollbars=1, resizable=1, width=500px, height=400px, left=' + left + ', top=' + top);
  },

  openNotes: function (notesUrl) {
    var top = ((screen.height / 2) - 200) + 'px';
    var left = ((screen.width / 2) - 250) + 'px';
    window.open(notesUrl, 'Notes', 'toolbar=0, location=0, directories=0, status=0, menubar=0, scrollbars=1, resizable=0, width=500px, height=400px, left=' + left + ', top=' + top);
  },

  openProjects: function (projectsUrl) {
    var top = ((screen.height / 2) - 200) + 'px';
    var left = ((screen.width / 2) - 250) + 'px';
    window.open(projectsUrl, 'ProjectsPopup', 'toolbar=0, location=0, directories=0, status=0, menubar=0, scrollbars=1, resizable=0, width=820px, height=600px, left=' + left + ', top=' + top);
  },

  openReview: function (courseVersionId, unit, activityId, quizId, courseCode, concepts) {
    try {
      var popup = new PopupWindowClass();
      var x = (window.screenX ? window.screenX : 0) + (((window.outerWidth ? window.outerWidth : document.body.clientWidth) - 735) / 2);
      var y = (window.screenY ? window.screenY : 0) + (((window.outerHeight ? window.outerHeight : document.body.clientHeight) - 510) / 2);
      var url = 'Review.aspx?courseVersionId=' + courseVersionId + '&unit=' + unit + '&courseCode=' + courseCode + '&concepts=' + concepts;
      if (activityId != null && activityId !== '') { url += '&activityId=' + activityId; }
      if (quizId != null && quizId !== '') { url += '&quizId=' + quizId; }

      popup.url = url;
      popup.name = 'review';
      popup.width = 1160;
      popup.height = 768;
      popup.resizable = false;
      popup.scrollbars = true;
      popup.statusbar = false;
      popup.left = x;
      popup.top = y;

      var win = popup.GetWindowObject();
      win.focus();
    }
    catch (ex) {
      Course.sendError('Course.openReview', ex);
    }
  },

  openVideoTranscriptPopup: function (lnk) {
    var transcript = $(lnk).parents('.TranscriptContainer').find('.TranscriptContent').html();
    var popup = new PopupWindowClass();

    var x = (window.screenX ? window.screenX : 0) + (((window.outerWidth ? window.outerWidth : document.body.clientWidth) - 500) / 2);
    var y = (window.screenY ? window.screenY : 0) + (((window.outerHeight ? window.outerHeight : document.body.clientHeight) - 500) / 2);

    popup.width = 500;
    popup.height = 500;
    popup.resizable = true;
    popup.scrollbars = true;
    popup.statusbar = false;
    popup.left = x;
    popup.top = y;
    popup.name = 'transcript';

    var win = popup.GetWindowObject();
    win.document.open();
    var pg = '<html><head><title>Video Transcription</title><link href="Styles/Global.css" rel="stylesheet" type="text/css" /><style>body { background-color: #fdfdfd; margin: 0px; overflow-y: scroll; }</style></head>';
    pg += '<body><div style="padding: 5px;" class="Label">' + transcript + '</div></body></html>';

    win.document.write(pg);
    win.document.close();
    win.focus();

    //
    // Maybe just have the transcript text be in the popup insted of the div AND the transcript??
    //

    //    $('#' + transcriptDivId).toggle();
    //    var lnk = $('#' + toggleLinkId);
    //    if (lnk.text() === 'View Transcript') {
    //      lnk.text('Hide Transcript');
    //    } else {
    //      lnk.text('View Transcript');
    //    }
  },

  getFinalExamRequestInfo: function () {

    var personId = Global.getQueryStringValue('pid');
    var courseVersionId = Global.getQueryStringValue('courseVersionId');
    var unit = Global.getQueryStringValue('unit');
    Courses.isExamApprovedForStudent(personId, courseVersionId, unit, Course.examApprovalCheckComplete, Course.examApprovalCheckFailed);
    //		if (Courses.isExamApprovedForStudent(personId, courseVersionId, unit)) {
    //			alert('Bing!');
    //			window.location.href = 'ExamList.aspx';
    //			return;
    //		}

    //		Courses.getFinalExamRequestInfo(personId, courseVersionId, unit, Course.finalExamRequestInfoComplete, Course.finalExamRequestInfoFailed);
  },

  examApprovalCheckComplete: function (results) {
    if (results) {
      window.location.href = 'ExamList.aspx';
    } else {
      var personId = Global.getQueryStringValue('pid');
      var courseVersionId = Global.getQueryStringValue('courseVersionId');
      var unit = Global.getQueryStringValue('unit');

      Courses.getFinalExamRequestInfo(personId, courseVersionId, unit, Course.finalExamRequestInfoComplete, Course.finalExamRequestInfoFailed);
    }
  },

  examApprovalCheckFailed: function (error) {
    alert('We were unable to retrieve information about your exam approval. If this problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
  },

  finalExamRequestInfoComplete: function (results) {
    var message = $('#divFinalExamRequestMessage');
    var messageContent = '<p>It is recommended that you complete all coursework for the unit before taking the final exam. Below is a summary of your progress for this unit:</p>';
    var quizProgress = results.quizProgress;
    var activityProgress = results.activityProgress;
    var projectProgress = results.projectProgress;
    var unitProgress = $('.ProgressPercent').html();
	  var examApprovalRequestSubmitted = results.examApprovalRequestSubmitted;

	  if (examApprovalRequestSubmitted) {
	  	messageContent = "<p>A request has already been submitted for this unit exam.</p><p>Please contact your teacher if you have questions about this request.</p>";
		  $('#btnSendRequest').hide();
	  } else {
		  messageContent += '<table cellspacing="5" cellpadding="0">';
		  messageContent += '<tr><td>Activities Passed:</td><td id="activityProgressInfo">' + activityProgress + '</td></tr>';
		  messageContent += '<tr><td>Projects Passed:</td><td id="projectProgressInfo">' + projectProgress + '</td></tr>';
		  messageContent += '<tr><td>Quizzes Passed:</td><td id="quizProgressInfo">' + quizProgress + '</td></tr>';
		  messageContent += '<tr><td colspan="2" style="border-top: solid 1px #cccccc"> </td></tr>';
		  messageContent += '<tr><td style="font-weight: bold">Overall Progress:</td><td style="font-weight: bold">' + unitProgress + '</td></tr>';
		  messageContent += '</table>';
		  messageContent += '<p>Are you sure you want to send a request to your teacher to approve this exam?</p>';
		  $('#btnSendRequest').show();
	  }

	  message.html(messageContent);

    App.Popup.show('divFinalExamRequest', 'Request Final Exam Approval', false, 'default');
  },

  finalExamRequestInfoFailed: function (error) {
    alert('We were unable to retrieve information about your unit progress. If this problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
  },

  sendFinalExamRequest: function () {
    var personId = Global.getQueryStringValue('pid');
    var courseVersionId = Global.getQueryStringValue('courseVersionId');
    var unit = Global.getQueryStringValue('unit');
    var quizProgress = $('#quizProgressInfo').html();
    var activityProgress = $('#activityProgressInfo').html();
    var projectProgress = $('#projectProgressInfo').html();
    var unitProgress = $('.ProgressPercent').html();

    Courses.sendFinalExamRequest(personId, courseVersionId, unit, quizProgress, activityProgress, projectProgress, unitProgress, Course.finalExamRequestCompelte, Course.finalExamRequestFailed);
    Common.Popup.hide('divFinalExamRequest');
  },

  finalExamRequestCompelte: function () {
    alert('Your request was sent successfully.');
  },

  finalExamRequestFailed: function (error) {
    alert('Failed to save request. If this problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
  },

  cancelFinalExamRequest: function () {
    Common.Popup.hide('divFinalExamRequest');
  }

};




var Activity = {

  checkAnswers: function (saveActivity) {
    try {
      Activity.score(saveActivity);
      $('.CourseContent').scrollTop(0);
    }
    catch (ex) {
      Course.sendError('Activity.checkAnswers', ex);
    }
  },

  score: function (saveAttempt) {
    try {
      var questions = $('.Question');
      var divScore = $('.ActivityScore');
      var correctAnswers = 0;
      var answersArray = new Array();

      questions.each(function (i) {
        var q = $(this);
        var container = q.parents('.QuestionContainer');
        var qNum = q.data('questionnumber');
        var answerIndexes = container.find('.HiddenAnswerIndexes').val();
        var imgGrade = container.find('.Grade');
        var divReview = container.find('.ReviewButton');
        var answerChoiceControls = q.find('.AnswerChoiceControl');
        var typeClass = q.find('.AnswerChoiceControl:first').attr('class');
        var correct = true;
        var selectedAnswers;

        answersArray.push({ index: i, selectedAnswers: selectedAnswers.substring(1) });

        imgGrade.attr('src', correct ? 'Images/GreenCheck24.gif' : 'Images/RedX24.gif');
        imgGrade.attr('title', correct ? 'Correct Answer' : 'Incorrect Answer');
        imgGrade.show();

        if (correct) {
          divReview.hide();
        }
        else {
          divReview.show();
        }

        correctAnswers += correct ? 1 : 0;
      });

      var intScore = Math.round((correctAnswers / questions.length) * 100);
      var score = String(intScore);
      divScore.html('Score: ' + score + '%').removeClass('Fail').removeClass('Pass').addClass(intScore >= 60 ? 'Pass' : 'Fail');

      if (saveAttempt) {
        var activityId = $('.ActivityContainer').attr('id').substring(8);
        var selectedAnswers = '';

        questions.each(function (i) {
          selectedAnswers += (i + 1) + ':' + answersArray[i].selectedAnswers + ';';
        });

        var personId = Global.getQueryStringValue('pid');
        var courseVersionId = Global.getQueryStringValue('courseVersionId');
        var unit = Global.getQueryStringValue('unit');

        if (personId !== '' && courseVersionId !== '' && unit !== '' && activityId !== '' && selectedAnswers !== '' && intScore >= 0 && intScore <= 100 && score !== '') {
          Courses.saveActivityAttempt(personId, courseVersionId, unit, activityId, selectedAnswers, score, Activity.showSaveResults, Activity.saveActivityAttemptFailed);
        }
        else {
          alert('There was an error saving your activity. If the problem persists, please contact the Cyber High office.');
        }
      }
    }
    catch (ex) {
      Course.sendError('Activity.score', ex);
    }
  },

  showSaveResults: function () {

  },

  saveActivityAttemptFailed: function (error) {
    alert('There was an error saving your activity. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
  },

  clearAnswers: function () {
    try {
      $('.Question').each(function () {
        var q = $(this);
        var container = q.parents('.QuestionContainer');
        var imgGrade = container.find('.Grade');
        var answerChoiceControls = q.find('.AnswerChoiceControl');
        var typeClass = q.find('.AnswerChoiceControl:first').attr('class');

        if (typeClass.indexOf('RadioButton') > -1 || typeClass.indexOf('CheckBox') > -1) {
          answerChoiceControls.each(function () {
            $(this).find('input:checked').prop('checked', false);
          });
        }
        else if (typeClass.indexOf('DropDown') > -1) {
          answerChoiceControls[0].selectedIndex = -1;
        }

        imgGrade.attr('src', '').attr('title', '').hide();
      });

      $('.ActivityScore').removeClass('Pass').removeClass('Fail').html('');
      $('.CourseContent').scrollTop(0);
    }
    catch (ex) {
      Course.sendError('Activity.clearAnswers', ex);
    }
  },

  showTeacherComments: function (div) {
    $(div).hide();
    $(div).parents('.TeacherComments').find('.Comments').show();
  },

  toggleAnswerAudio: function (btn) {
    var audio = $(btn).parents('.Answer').find('audio');
    var audioElement = audio.get(0);

    if (audioElement.paused) {
      audioElement.play();
    }
    else {
      audioElement.pause();
    }
  },

  toggleQuestionAudio: function (btn) {
    var audio = $(btn).parents('.QuestionTable').find('audio');
    var audioElement = audio.get(0);

    if (audioElement.paused) {
      audioElement.play();
    }
    else {
      audioElement.pause();
    }
  }

}




var Pbl = {

	selectPblTopic: function (ddl) {
		var selectedValue = $(ddl).val();

		if (selectedValue !== '' && typeof (selectedValue) !== 'undefined') {
			var ddlPblType = $('[id$="ddlPblTypes"]');

			if (ddlPblType.val().length > 0) {
				$('[id$="btnSaveChoices"]').removeProp('disabled');
			}
			else {
				$('[id$="btnSaveChoices"]').prop('disabled', 'disabled');
			}
		}
	},

	selectPblType: function () {
		var ddlTopic = $('[id$="ddlTopic"]');

		if (ddlTopic.val().length > 0) {
			$('[id$="btnSaveChoices"]').removeProp('disabled');
		}
		else {
			$('[id$="btnSaveChoices"]').prop('disabled', 'disabled');
		}
	},

	checkPblActivityAllowed: function () {
		var personID = Global.getQueryStringValue('pid');
		var courseVersionID = Global.getQueryStringValue('courseVersionId');
		var unit = Global.getQueryStringValue('unit');
		var pblActivityID = Global.getQueryStringValue('req');
		pblActivityID = pblActivityID.length > 3 ? pblActivityID.substring(3) : '';
		Courses.checkPblActivityAllowed(pblActivityID, personID, courseVersionID, unit, Pbl.pblAttemptAllowed, Pbl.deletingPblAttemptFailed);
	},

	deletingPblAttemptFailed: function (error) {
		alert('There was an error deleting your project. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
	},

	pblAttemptAllowed: function (results) {
		var allowed = results;
		var conf;
		var activityAttemptID = $('#hfAttemptID').val();
		if (allowed == 'True') {
			conf = confirm('Deleting this project includes permanently deleting your current topic, project type, media uploads and text. ' +
											'This action CANNOT be undone. Should you want to continue, please close all tabs associated with your current project to prevent page errors.' +
											'\n\nClick OK if you are sure you want to delete this project. Click Cancel to go back.');
			if (conf) {
				Courses.deletePblActivityAttempt(activityAttemptID, Pbl.attemptDeleted, Pbl.deletingPblAttemptFailed);
			}
		}
		else {
			conf = confirm('Deleting this project to start a new project is not available due to your school’s site settings. ' +
												'If you click OK, this page will go back to the unit’s Table of Contents page and this project will no longer appear.' +
												'\n\nClick OK if you wish to proceed with deleting this project. Click Cancel to go back.');
			if (conf) {
				Courses.deletePblActivityAttempt(activityAttemptID, Pbl.attemptDeletedNoRetake, Pbl.deletingPblAttemptFailed);
			}
		}
	},

	attemptDeleted: function () {
		window.location = window.location;
	},

	attemptDeletedNoRetake: function () {
		window.location = $('#hfLandingPageURL').val();
	},

	deletingPblAttemptFailed: function (error) {
		alert('There was an error deleting your project. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
	},

	createPblActivityAttempt: function (btn) {
		$(btn).hide();

		var ddlTopic = $('[id$="ddlTopic"]');
		var ddlPblTypes = $('[id$="ddlPblTypes"]');
		var topicId = ddlTopic.val();
		var typeId = ddlPblTypes.val();

		// We want to give them the option to opt out of a song, podcast, or video type if they don't have the correct filetype to upload
		if (typeId === '3' || typeId === '6' || typeId === '8') {
			$('#btnResetProject').show();
		}
		if (typeId === '7') {
			$('[id$="lblResearchHeader"]').show();
			$('[id$="divResearchSubmitMessage"]').show();
		}
    
		ddlTopic.prop('disabled', 'disabled');
		ddlPblTypes.prop('disabled', 'disabled');

		if (topicId !== '' && typeId !== '') {
			var personId = Global.getQueryStringValue('pid');
			var pblActivityId = Global.getQueryStringValue('req');
			pblActivityId = pblActivityId.length > 3 ? pblActivityId.substring(3) : '';

			if (personId !== '' && pblActivityId !== '') {
				Courses.createPblActivityAttempt(personId, pblActivityId, topicId, typeId, Pbl.attemptCreated, Pbl.creatingPblAttemptFailed);
			}
			else {
				alert('There was an error saving your choices. If this problem persists, please contact Cyber High.');
			}
		}
		else {
			alert('There was an error saving your choices. If this problem persists, please contact Cyber High.');
		}
	},

	creatingPblAttemptFailed: function (error) {
		alert('There was an error creating your project. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
	},

	attemptCreated: function (results) {
		$('[id$="hfAttemptID"]').val(results);
		var pblTypeId = $('[id$="ddlPblTypes"]').val();
    
		if (pblTypeId === '1') { //Blog
			$('#divBlogPost').show();
		}
		else if (pblTypeId === '2') { //Wiki
			Pbl.rgWikis_GetData();
		}
		else if (pblTypeId === '3') { //Podcast
			$('#lblUploadHeader').html('Upload Your Podcast');
			$('#divUpload').show();
			$('[class*="AllowedFileTypes"]').html('Podcast must be in MP3, OGA, WAV, or WMA format');
		}
		else if (pblTypeId === '4') { //Website
			$('#divNewWebsite').show();
		}
		else if (pblTypeId === '5') { //Sketch
			$('#divNewSketch').show();
			$('#txtSketchTitle').focus();
		}
		else if (pblTypeId === '6') { //Song
			$('#lblUploadHeader').html('Upload Your Song');
			$('#divUpload').show();
			$('[class*="AllowedFileTypes"]').html('Song must be in MP3, OGA, WAV, or WMA format');
		}
		else if (pblTypeId === '7') { //Research
			$('#divResearchContainer').find('.AddNewEntry').show();
			$('#divResearchContainer').show();
		}
		else if (pblTypeId === '8') { //Video
			$('#lblUploadHeader').html('Upload Your Video');
			$('#divUpload').show();
			$('[class*="AllowedFileTypes"]').html('Video must be in MP4, OGV, MOV, or AVI format');
		}
		else if (pblTypeId === '9') { //Presentation
			$('#divNewPresentation').show();
		}
		else if (pblTypeId === '10') { //Story
			$('#divNewStory').show();
		}
		else if (pblTypeId === '11') { //Poster
			$('#divNewPoster').show();
		}
	},

	clientFileUploadValidationError: function (sender, args) {
		var fileExtention = args.get_fileName().substring(args.get_fileName().lastIndexOf('.') + 1, args.get_fileName().length);
		if (args.get_fileName().lastIndexOf('.') === -1 || sender.get_allowedFileExtensions().indexOf(fileExtention) === -1) {
			alert('Files of type "' + fileExtention.toUpperCase() + '" are not allowed for this project.');
		}
	},

	clientFileSelected: function(sender, args) {
		for (var fileindex in sender._uploadedFiles) {
			if (sender._uploadedFiles[fileindex].fileInfo.FileName == args.get_fileName()) {
				sender._uploadedFiles[fileindex].fileInfo.FileName = Common.SanitizeFileName(args.get_fileName());
			}
		}
	},

	clientFileUploaded: function (sender, args) {
		var filename = args.get_fileName();
		var personId = Global.getQueryStringValue('pid');
		var pblActivityId = Global.getQueryStringValue('req');
		var pblTypeId = $('[id$="ddlPblTypes"]').val();

		pblActivityId = pblActivityId.length > 3 ? pblActivityId.substring(3) : '';
		$find($('[id$="upload1"]').attr('id')).deleteAllFileInputs();

		if (pblTypeId.length === 0) {
			alert('Error determining project type.');
			return;
		}

		pblTypeId = parseInt(pblTypeId);

		if (pblTypeId === 3) { //Podcast
			Courses.createPodcast(personId, pblActivityId, filename, Pbl.uploadSaved, Pbl.uploadFailed);
		}
		else if (pblTypeId === 6) { //Song
			Courses.createSong(personId, pblActivityId, filename, Pbl.uploadSaved, Pbl.uploadFailed);
		}
		else if (pblTypeId === 8) { //Video
			Courses.createVideo(personId, pblActivityId, filename, Pbl.uploadSaved, Pbl.uploadFailed);
		}
	},

	uploadFailed: function (error) {
		var pblTypeId = $('[id$="ddlPblTypes"]').val();

		if (pblTypeId === 3) { //Podcast
			alert('There was an error uploading your podcast. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
		}
		else if (pblTypeId === 6) { //Song
			alert('There was an error uploading your song. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
		}
		else if (pblTypeId === 8) { //Video
			alert('There was an error uploading your video. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
		}
	},

	uploadSaved: function () {
		var pblTypeId = $('[id$="ddlPblTypes"]').val();
		var btnEditProjectInline = $('#btnEditProjectInline');

		if (pblTypeId.length === 0) {
			alert('Error determining project type.');
			return;
		}

		pblTypeId = parseInt(pblTypeId);

		if (pblTypeId === 3) { //Podcast
			$('#divUpload').hide();
			$('#lblMediaHeader').html('Listen To Your Podcast');
			$('#divMedia').append($('<span style="padding-top: 10px" class="Label">Your podcast was uploaded successfully and is being processed on the server. Please check back within the next few minutes, and your podcast should be available. You may need to refresh the page for it to appear.</span>'));
			$('#divMedia').show();

			if (!btnEditProjectInline.hasClass('ClickEventBound')) {
				btnEditProjectInline.on('click', function () { Pbl.editPodcast(); }).attr('value', 'Edit Podcast');
				btnEditProjectInline.addClass('ClickEventBound');
			}

			btnEditProjectInline.attr('value', 'Edit Podcast').show();
		}
		else if (pblTypeId === 6) { //Song
			$('#divUpload').hide();
			$('#lblMediaHeader').html('Listen To Your Song');
			$('#divMedia').append($('<span style="padding-top: 10px" class="Label">Your song was uploaded successfully and is being processed on the server. Please check back within the next few minutes, and your song should be available. You may need to refresh the page for it to appear.</span>'));
			$('#divMedia').show();

			if (!btnEditProjectInline.hasClass('ClickEventBound')) {
				btnEditProjectInline.on('click', function () { Pbl.editSong(); }).attr('value', 'Edit Song');
				btnEditProjectInline.addClass('ClickEventBound');
			}

			btnEditProjectInline.attr('value', 'Edit Song').show();
		}
		else if (pblTypeId === 8) { //Video
			$('#divUpload').hide();
			$('#lblMediaHeader').html('Watch Your Video');
			$('#divMedia').append($('<span style="padding-top: 10px" class="Label">Your video was uploaded successfully and is being processed on the server. Please check back within the next few minutes, and your video should be available. You may need to refresh the page for it to appear.</span>'));
			$('#divMedia').show();

			if (!btnEditProjectInline.hasClass('ClickEventBound')) {
				btnEditProjectInline.on('click', function () { Pbl.editVideo(); }).attr('value', 'Edit Video');
				btnEditProjectInline.addClass('ClickEventBound');
			}

			btnEditProjectInline.attr('value', 'Edit Video').show();
		}

		var btnSubmitForGrading = $('#btnSubmitForGrading');

		if (!btnSubmitForGrading.hasClass('ClickEventBound')) {
			btnSubmitForGrading.on('click', function () { Pbl.submitForGrading(this, $('[id$="hfAttemptID"]').val()); });
			btnSubmitForGrading.addClass('ClickEventBound');
		}

		btnSubmitForGrading.show();

		if (pblTypeId != 7) {
			$('#btnResetProject').show();
		}
	},

	editPodcast: function () {
		$('#divMedia').hide();
		$('#btnEditProjectInline').hide();
		$('#btnSubmitForGrading').hide();
		$('#btnResetProject').hide();
		$('#divUpload').show();
	},

	editSong: function () {
		$('#divMedia').hide();
		$('#btnEditProjectInline').hide();
		$('#btnSubmitForGrading').hide();
		$('#btnResetProject').hide();
		$('#divUpload').show();
	},

	editVideo: function () {
		$('#divMedia').hide();
		$('#btnEditProjectInline').hide();
		$('#btnSubmitForGrading').hide();
		$('#btnResetProject').hide();
		$('#divUpload').show();
	},

	cancelSketchEdit: function () {
		$('#divSketchEditor').hide();
		$('#divMedia').show();
		$('#btnEditProjectInline').show();
		$('#btnSubmitForGrading').show();
		$('#btnResetProject').show();
	},

	editPoster: function(posterUrl) {
		Pbl.openProjectEditor(posterUrl);
	},

	cancelEditPoster: function() {

	},

	cancelMediaUpload: function () {
		$('#divUpload').hide();
		$('#divMedia').show();
		$('#btnEditProjectInline').show();
		$('#btnSubmitForGrading').show();
		$('#btnResetProject').show();
	},

	showNewWikiPanel: function () {
		Pbl.hideWikiList();
		$('#divNewWiki').show();
	},

	saveWikiTitle: function () {
		var personId = Global.getQueryStringValue('pid');
		var pblActivityId = $('input[id$="hfPblActivityID"]').val();
		var title = $('#txtWikiTitle').val();
		var topicId = $('[id$="ddlTopic"]').val();
		Courses.saveWikiTitle(personId, pblActivityId, title, topicId, Pbl.wikiTitleSaved, Pbl.savingWikiTitleFailed);
	},

	savingWikiTitleFailed: function (error) {
		alert('There was an error saving your wiki title. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
	},

	wikiTitleSaved: function (results) {
		var btnEditProject = $('[id$="btnEditProject"]');
		var btnViewProject = $('#btnViewProject');
		var btnSubmitForGrading = $('#btnSubmitForGrading');

		$('#divNewWiki').hide();
		btnEditProject.attr('value', 'Open Wiki Editor');
		btnEditProject.on('click', function () { Course.openUrlWindow(results, 'Project'); });
		btnEditProject.show();

		btnViewProject.attr('value', 'View Wiki');
		btnViewProject.on('click', function () { Course.openUrlWindow(results.replace('WikiEditor.aspx', 'Wiki.aspx'), 'Project'); });
		btnViewProject.show();

		if (!btnSubmitForGrading.hasClass('ClickEventBound')) {
			btnSubmitForGrading.on('click', function () { Pbl.submitForGrading(this, $('[id$="hfAttemptID"]').val()); });
			btnSubmitForGrading.addClass('ClickEventBound');
		}

		btnSubmitForGrading.show();
		$('#btnResetProject').show();
	},

	showWikiList: function () {
		$('#divWikiList').show();
	},

	hideWikiList: function () {
		$('#divWikiList').hide();
	},

	rgWikis_GetData: function () {
		var personId = Global.getQueryStringValue('pid');
		var pblActivityTopicId = $('[id$="ddlTopic"]').val();
		Courses.getOpenWikis(personId, pblActivityTopicId, Pbl.rgWikis_LoadData, Pbl.getOpenWikisFailed);
	},

	getOpenWikisFailed: function (error) {
		alert('There was an error loading available wikis. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
	},

	rgWikis_LoadData: function (results) {
		var id = $('[id$="rgWikis"]').attr('id');
		var grid = $find(id);
		var mtv = grid.get_masterTableView();

		mtv.set_dataSource(results);
		mtv.dataBind();
		Pbl.showWikiList();
	},

	rgWikis_RowDataBound: function (sender, args) {
		var wikiId = args.get_dataItem().wikiID;
		var lnkJoinWiki = $(args.get_item().get_cell('Join')).find('a');
		lnkJoinWiki.removeAttr('onclick');
		lnkJoinWiki.on('click', function () { Pbl.joinWiki(wikiId); return false; });
	},

	openProject: function (attemptId) {
		var topicId = $('[id$="ddlTopic"]').val();
		var pblTypeId = $('[id$="ddlPblTypes"]').val();
		var valid = true;

		$('#rfvTopic').hide();
		$('#rfvPblType').hide();

		if (topicId == null || typeof (topicId) === 'undefined') {
			valid = false;
			$('#rfvTopic').show();
		}

		if (pblTypeId == null || typeof (pblTypeId) === 'undefined') {
			valid = false;
			$('#rfvPblType').show();
		}

		if (valid) {
			if (attemptId == null) {
				Pbl.createProjectAttempt(topicId, pblTypeId);
			}
		}
	},

	viewProject: function (url) {
		Course.openUrlWindow(url, 'Project');
	},

	openProjectEditor: function (url) {
		Course.openUrlWindow(url, 'Project');
	},

	joinWiki: function (wikiId) {
		var personId = Global.getQueryStringValue('pid');
		var pblActivityId = $('[id$="hfPblActivityID"]').val();
		Courses.joinWiki(personId, wikiId, pblActivityId, Pbl.wikiJoined, Pbl.joiningWikiFailed);
	},

	joiningWikiFailed: function (error) {
		alert('There was an error joining the wiki. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
	},

	wikiJoined: function (results) {
		if (results !== '') {
			var btnEditProject = $('[id$="btnEditProject"]');
			var btnViewProject = $('#btnViewProject');
			var btnSubmitForGrading = $('#btnSubmitForGrading');

			$('#divNewWiki').hide();
			btnEditProject.attr('value', 'Open Wiki Editor');
			btnEditProject.on('click', function () { Course.openUrlWindow(results, 'Project'); });
			btnEditProject.show();

			btnViewProject.attr('value', 'View Wiki');
			btnViewProject.on('click', function () { Course.openUrlWindow(results.replace('WikiEditor.aspx', 'Wiki.aspx'), 'Project'); });
			btnViewProject.show();

			if (!btnSubmitForGrading.hasClass('ClickEventBound')) {
				btnSubmitForGrading.on('click', function () { Pbl.submitForGrading(this, $('[id$="hfAttemptID"]').val()); });
				btnSubmitForGrading.addClass('ClickEventBound');
			}

			btnSubmitForGrading.show();
			$('#btnResetProject').show();
			Pbl.hideWikiList();
		}
		else {
			alert('There was an error joining this wiki. If the problem persists, please contact Cyber High support.');
		}
	},

	fileUploaded: function (pblTypeId) {
		alert('File Uploaded: ' + pblTypeId);
	},

	saveBlogPost: function () {
		var postContent = CKEDITOR.instances[$('[id$="ckeEditor"]').attr('id')].getData();

		if ($('#txtPostTitle').val().trim().length === 0 || $('#txtPostTitle').val().trim() === "Post Title" || Vulgarities.validate(postContent.toLowerCase())) {
			$('#lblPostTitleValidator').toggle($('#txtPostTitle').val().trim().length === 0 || $('#txtPostTitle').val().trim() === "Post Title");
			$('#lblBlogLanguageFilter').toggle(Vulgarities.validate(postContent.toLowerCase()));
		}
		else {
			var personId = Global.getQueryStringValue('pid');
			var pblActivityId = $('[id$="hfPblActivityID"]').val();
			var postId = $('[id$="hfPblObjectID"]').val();
			var postTitle = $('[id$="txtPostTitle"]').val();
			$('#lblBlogLanguageFilter').hide();
			$('#lblPostTitleValidator').hide();
			Courses.saveBlogPost(personId, pblActivityId, postId, postTitle, postContent, Pbl.blogPostSaved, Pbl.savingBlogPostFailed);
		}
	},

	savingBlogPostFailed: function (error) {
		alert('There was an error saving your blog post. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
	},

	blogPostSaved: function (results) {
		var divBlog = $('#divBlog');
		divBlog.find('#lblBlogTitle').html($('[id$="txtPostTitle"]').val());
		divBlog.find('#divBlogContent').html(CKEDITOR.instances[$('[id$="ckeEditor"]').attr('id')].getData());
		$('#divBlogPost').hide();
		$('[id$="hfPblObjectID"]').val(results);
		divBlog.show();

		var btnEditProjectInline = $('#btnEditProjectInline');
		var btnSubmitForGrading = $('#btnSubmitForGrading');

		if (!btnEditProjectInline.hasClass('ClickEventBound')) {
			btnEditProjectInline.on('click', function () { Pbl.editBlogPost(); }).attr('value', 'Edit Blog Post');
			btnEditProjectInline.addClass('ClickEventBound');
		}

		if (!btnSubmitForGrading.hasClass('ClickEventBound')) {
			btnSubmitForGrading.on('click', function () { Pbl.submitForGrading(this, $('[id$="hfAttemptID"]').val()); });
			btnSubmitForGrading.addClass('ClickEventBound');
		}

		btnEditProjectInline.show();
		btnSubmitForGrading.show();
		$('#btnResetProject').show();
		$('.ViewFullBlogButton').show();
	},

	editBlogPost: function () {
		$find($('[id$="txtPostTitle"]').attr('id')).set_value($('#lblBlogTitle').html());
		CKEDITOR.instances[$('[id$="ckeEditor"]').attr('id')].setData($('#divBlogContent').html());

		$('#divBlog').hide();
		$('#btnEditProjectInline').hide();
		$('#btnSubmitForGrading').hide();
		$('#btnResetProject').hide();
		$('.ViewFullBlogButton').hide();
		$('#divBlogPost').show();
	},

	saveSketchTitle: function() {
		var personId = Global.getQueryStringValue('pid');
		var pblActivityId = $('[id$="hfPblActivityID"]').val();
		var title = $('#txtSketchTitle').val();
		if (title.trim().length === 0) {
			$('#lblSketchTitleValidator').show();
		}
		else {
			Courses.saveSketchTitle(personId, pblActivityId, title, Pbl.sketchTitleSaved, Pbl.savingSketchTitleFailed);
		}
	},

	savingSketchTitleFailed: function(error) {

	},

	sketchTitleSaved: function (results) {
		if (results === '') return;

		var btnEditProject = $('[id$="btnEditProject"]');
		var btnViewProject = $('#btnViewProject');
		var btnSubmitForGrading = $('#btnSubmitForGrading');

		$('#divNewSketch').hide();
		btnEditProject.attr('value', 'Open Sketch Editor');
		btnEditProject.on('click', function () { Course.openUrlWindow(results, 'Project'); });
		btnEditProject.show();

		//btnViewProject.attr('value', 'View Sketch');
		//btnViewProject.on('click', function () { Course.openUrlWindow(results.replace('Sketches/SketchPad.aspx', 'Sketches/Sketch.aspx'), 'Project'); });
		//btnViewProject.show();

		if (!btnSubmitForGrading.hasClass('ClickEventBound')) {
			btnSubmitForGrading.on('click', function () { Pbl.submitForGrading(this, $('[id$="hfAttemptID"]').val()); });
			btnSubmitForGrading.addClass('ClickEventBound');
		}

		btnSubmitForGrading.show();
		$('#btnResetProject').show();
	},

	savePosterTitle: function() {
		var personId = Global.getQueryStringValue('pid');
		var pblActivityId = $('[id$="hfPblActivityID"]').val();
		var title = $('#txtPosterTitle').val();
		Courses.savePosterTitle(personId, pblActivityId, title, Pbl.posterTitleSaved, Pbl.savingPosterTitleFailed);
	},

	savingPosterTitleFailed: function (error) {
		
	},

	posterTitleSaved: function (results) {
		if (results === '') return;

		var btnEditProject = $('[id$="btnEditProject"]');
		var btnViewProject = $('#btnViewProject');
		var btnSubmitForGrading = $('#btnSubmitForGrading');

		$('#divNewPoster').hide();
		btnEditProject.attr('value', 'Open Poster Editor');
		btnEditProject.on('click', function () { Course.openUrlWindow(results, 'Project'); });
		btnEditProject.show();

		if (!btnSubmitForGrading.hasClass('ClickEventBound')) {
			btnSubmitForGrading.on('click', function () { Pbl.submitForGrading(this, $('[id$="hfAttemptID"]').val()); });
			btnSubmitForGrading.addClass('ClickEventBound');
		}

		btnSubmitForGrading.show();
		$('#btnResetProject').show();
	},

  saveStoryTitle: function () {
    var personId = Global.getQueryStringValue('pid');
    var pblActivityId = $('[id$="hfPblActivityID"]').val();
    var title = $('#txtStoryTitle').val();
    if (title.trim().length === 0) {
      $('#lblStoryTitleValidator').show();
    }
    else {
      Courses.saveStoryTitle(personId, pblActivityId, title, Pbl.storyTitleSaved, Pbl.savingStoryTitleFailed);
    }
  },

  savingStoryTitleFailed: function (error) {
    alert('There was an error saving your story title. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
  },

  storyTitleSaved: function (results) {
    var btnEditProject = $('[id$="btnEditProject"]');
    var btnViewProject = $('#btnViewProject');
    var btnSubmitForGrading = $('#btnSubmitForGrading');

    $('#divNewStory').hide();
    btnEditProject.attr('value', 'Open Story Editor');
    btnEditProject.on('click', function () { Course.openUrlWindow(results, 'Project'); });
    btnEditProject.show();

    btnViewProject.attr('value', 'View Story');
    btnViewProject.on('click', function () { Course.openUrlWindow(results.replace('StoryEditor.aspx', 'Story.aspx'), 'Project'); });
    btnViewProject.show();

    if (!btnSubmitForGrading.hasClass('ClickEventBound')) {
      btnSubmitForGrading.on('click', function () { Pbl.submitForGrading(this, $('[id$="hfAttemptID"]').val()); });
      btnSubmitForGrading.addClass('ClickEventBound');
    }

    btnSubmitForGrading.show();
    $('#btnResetProject').show();
  },

  saveInitialPresentationTitle: function () {
  	if ($('#txtPresentationTitle').val().trim() == '') {
  		alert("Please enter a title for your project.");
  	}
		else {
  		Pbl.savePresentationTitle();
  	}
  },

  savePresentationTitle: function () {
    var personId = Global.getQueryStringValue('pid');
    var pblActivityId = $('[id$="hfPblActivityID"]').val();
    var title = $('#txtPresentationTitle').val();
    $('[id$="hfProjectName"]').val(title);
    Courses.savePresentationTitle(personId, pblActivityId, title, Pbl.presentationTitleSaved, Pbl.savingPresentationTitleFailed);
  },

  savingPresentationTitleFailed: function (error) {
    alert('There was an error saving your presentation title. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
  },

  savePresentationName: function () {
  	var personId = Global.getQueryStringValue('pid');
  	var pblActivityId = $('[id$="hfPblActivityID"]').val();
  	var title = $('#txtPresentationTitle').val().trim();
  	$('[id$="hfProjectName"]').val(title);
  	Courses.savePresentationName(personId, pblActivityId, title, Pbl.presentationNameSaved, Pbl.savingPresentationTitleFailed);
  },

  presentationNameSaved: function () {
		// Update project name text on page
  	$('#spanProjectNameText').text($('[id$="hfProjectName"]').val());
  	// Hide edit project name elements
  	Pbl.cancelProjectName();
  },

  presentationTitleSaved: function (results) {
    var btnEditProject = $('[id$="btnEditProject"]');
    var btnViewProject = $('#btnViewProject');
    var btnSubmitForGrading = $('#btnSubmitForGrading');
    var spanProjectNameText = $('#spanProjectNameText');
    var divProjectName = $('#divProjectName');

    $('#divNewPresentation').hide();
    btnEditProject.attr('value', 'Open Presentation Editor');
    btnEditProject.on('click', function () { Course.openUrlWindow(results, 'Project'); });
    btnEditProject.show();

    btnViewProject.attr('value', 'View Presentation');
    btnViewProject.on('click', function () { Course.openUrlWindow(results.replace('PresentationEditor.aspx', 'Presentation.aspx'), 'Project'); });
    btnViewProject.show();
    divProjectName.show();
    spanProjectNameText.text($('[id$="hfProjectName"]').val());

    if (!btnSubmitForGrading.hasClass('ClickEventBound')) {
      btnSubmitForGrading.on('click', function () { Pbl.submitForGrading(this, $('[id$="hfAttemptID"]').val()); });
      btnSubmitForGrading.addClass('ClickEventBound');
    }

    btnSubmitForGrading.show();
    $('#btnResetProject').show();

		// Hide edit project name elements
    Pbl.cancelProjectName();
  },

  editProjectName: function () {
  	$('#divProjectNameTextAndEdit').hide();
		$('#divEditProjectName').show();
  },

  cancelProjectName: function () {
  	$('#divProjectNameTextAndEdit').show();
  	$('#divEditProjectName').hide();
  	$('#txtEditProjectName').val($('#spanProjectNameText').text());
  },

  saveProjectName: function () {
  	var pblTypeID = $('[id$="ddlPblTypes"]').val();
  	if ($('#txtEditProjectName').val().trim() == "") {
  		alert("Please enter a title for your project.");
  	}
  	else {
  		if (pblTypeID === '9') { //Presentation
  			$('#txtPresentationTitle').val($('#txtEditProjectName').val());
  			Pbl.savePresentationName();
  		}
  	}
  },

  saveWebsiteTitle: function () {
    var personId = Global.getQueryStringValue('pid');
    var pblActivityId = $('[id$="hfPblActivityID"]').val();
    var title = $('#txtWebsiteTitle').val();

    if (title.trim().length === 0) {
      $('#lblWebsiteTitleValidator').show();
    }
    else {
      $('#lblWebsiteTitleValidator').hide();
      Courses.saveWebsiteTitle(personId, pblActivityId, title, Pbl.websiteTitleSaved, Pbl.savingWebsiteTitleFailed);
    }
  },

  savingWebsiteTitleFailed: function (error) {
    alert('There was an error saving your website title. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
  },

  websiteTitleSaved: function (results) {
    var btnEditProject = $('[id$="btnEditProject"]');
    var btnViewProject = $('#btnViewProject');
    var btnSubmitForGrading = $('#btnSubmitForGrading');

    $('#divNewWebsite').hide();

    btnEditProject.attr('value', 'Open Website Editor');
    btnEditProject.on('click', function () { Course.openUrlWindow(results, 'Project'); });
    btnEditProject.show();

    btnViewProject.attr('value', 'View Website');
    btnViewProject.on('click', function () { Course.openUrlWindow(results.replace('WebsiteEditor.aspx', 'Website.aspx'), 'Project'); });
    btnViewProject.show();

    if (!btnSubmitForGrading.hasClass('ClickEventBound')) {
      btnSubmitForGrading.on('click', function () { Pbl.submitForGrading(this, $('[id$="hfAttemptID"]').val()); });
      btnSubmitForGrading.addClass('ClickEventBound');
    }

    btnSubmitForGrading.show();
    $('#btnResetProject').show();
  },

  postEditorCommandExecuting: function (editor, args) {
    var commandName = args.get_commandName();

    if (commandName === 'InsertImage') {
      args.set_cancel(true);

      var appendImage = function (sender, args) {
        editor.pasteHtml(String.format("<img style=\"vertical-align: middle; width: {0}; height: {1}\" src=\"{2}\" />", args.width, args.height, args.src));
      }

      editor.showExternalDialog('InsertImage.aspx', null, 868, 593, appendImage, null, 'Insert Image', true, Telerik.Web.UI.WindowBehaviors.Close + Telerik.Web.UI.WindowBehaviors.Move, false, false);
    }
    else if (commandName === 'InsertVideo') {
      args.set_cancel(true);

      var appendVideo = function (sender, args) {
        editor.pasteHtml(String.format("<video controls=\"controls\"><source src=\"{0}\" type=\"video/mp4\" /></video>", args.src));
      }

      editor.showExternalDialog('InsertVideo.aspx', null, 868, 593, appendVideo, null, 'Insert Video', true, Telerik.Web.UI.WindowBehaviors.Close + Telerik.Web.UI.WindowBehaviors.Move, false, false);
    }
  },

  viewGrade: function () {
  	App.Popup.show('divPblGrade', 'Comments and Grade', false, 'default');
  },

  submitForGrading: function (btn, attemptId) {
  	if (confirm('If you would like to submit your project for grading, click OK. Click Cancel to go back. \nKeep in mind that you will not be able to delete your project topic or type after it is submitted. ')) {
    	$(btn).prop('disabled', 'disabled');
    	if ($('#btnEditProject')) {
    		$('#btnEditProject').prop('disabled', 'disabled');
				$('#btnResetProject').prop('disabled', 'disabled');
				$('#btnEditProjectInline').prop('disabled', 'disabled');

				// Reset & hide title information
    		if ($('[id$="ddlPblTypes"]').val() === '9') {
    			Pbl.cancelProjectName();
    			$('#btnEditProjectName').hide();
    		}
    	}
      Courses.submitProjectForGrading(attemptId, Pbl.submitForGradingCompleted, Pbl.submittingProjectFailed);
    }
  },

  submittingProjectFailed: function (error) {
    alert('There was an error submitting your project for grading. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
  },

  submitForGradingCompleted: function () {
    alert('Your project was successfully submitted for grading.');
  },

  editSketch: function (sketchUrl) {
  	Pbl.openProjectEditor(sketchUrl);
  },

  openSketchImage: function () {
    Pbl.loadSketchImagePicker();
    $('#divPopups').show();
  },

  saveSketchImage: function (path) {
    var filename = prompt('Please enter a filename for this sketch', '');

    if (filename != null && filename !== '') {
      var canvas = $('.Drawing').find('#drawingCanvas').get(0);
      //var context = canvas.getContext('2d');
      var personId = Global.getQueryStringValue('pid');
      var pblActivityId = $('[id$="hfPblActivityID"]').val();
      var sketchId = $('[id$="hfPblObjectID"]').val();

      if (canvas.style.background !== '') {
        var backgroundSrc = canvas.style.background;
        backgroundSrc = backgroundSrc.substring(5, backgroundSrc.lastIndexOf('"'));

        var cvs = $('#divSketchEditor').find('#divSaveSketch').find('canvas').get(0);
        var ctx = cvs.getContext('2d');

        var backgroundImage = new Image();
        backgroundImage.onload = function () {
          ctx.drawImage(backgroundImage, 0, 0);
        };

        backgroundImage.src = backgroundSrc;
        setTimeout(function () { Pbl.completeSketchSave(filename, path, personId, pblActivityId, sketchId); }, 100);
      }
      else {
        var img = canvas.toDataURL("image/png");
        Courses.saveSketch(personId, pblActivityId, img, path, filename, sketchId, Pbl.sketchImageSaved, Pbl.savingSketchFailed);
      }
    }
  },

  completeSketchSave: function (filename, path, personId, pblActivityId, sketchId) {
    var canvas = $('#divSketchEditor').find('#divSaveSketch').find('canvas').get(0);
    var context = canvas.getContext('2d');
    context.drawImage($('.Drawing').find('#drawingCanvas').get(0), 0, 0);

    var img = canvas.toDataURL("image/png");
    Courses.saveSketch(personId, pblActivityId, img, path, filename, sketchId, Pbl.sketchImageSaved, Pbl.savingSketchFailed);
  },

  savingSketchFailed: function (error) {
    alert('There was a problem saving your sketch. If this problem persists, please contact Cyber High. \n\n ERROR: ' + error.get_message());
  },

  sketchImageSaved: function (results) {
    var divMedia = $('#divMedia');
    var personId = Global.getQueryStringValue('pid');
    var btnSubmitForGrading = $('#btnSubmitForGrading');

    divMedia.find('img').remove();

    $('#lblMediaHeader').html('View Your Sketch');
    divMedia.append($('<img src="ClientUploads/' + personId + '/' + results.filename + '" alt="Student Sketch" style="margin-top: 10px" />'));

    $('#divSketchEditor').hide();
    divMedia.show();

    var btnEditProjectInline = $('#btnEditProjectInline');

    if (!btnEditProjectInline.hasClass('ClickEventBound')) {
      btnEditProjectInline.on('click', function () { Pbl.editSketch(); }).attr('value', 'Edit Sketch');
      btnEditProjectInline.addClass('ClickEventBound');
    }

    btnEditProjectInline.attr('value', 'Edit Sketch').show();

    if (!btnSubmitForGrading.hasClass('ClickEventBound')) {
      btnSubmitForGrading.on('click', function () { Pbl.submitForGrading(this, results.attemptID); });
      btnSubmitForGrading.addClass('ClickEventBound');
    }

    btnSubmitForGrading.show();
    $('#btnResetProject').show();
  },

  loadSketchImagePicker: function () {
    $('#MasterShadow').show();
    ImagePicker.open('SketchImage', '.png');
    $('[id$="sketchImagePicker1"]').find('.btnCancel').click(function () { Pbl.closeSketchImagePicker(); });
  },

  closeSketchImagePicker: function () {
    ImagePicker.close();
    $('#divPopups').hide();
    $('#MasterShadow').hide();
  },

  loadSketchImage: function (src) {
    var canvas = $('#divSketchEditor').find('.Canvas').find('#drawingCanvas');
    canvas.css('background', 'url(' + src + ')');
    ImagePicker.close();
    $('#divPopups').hide();
    $('#MasterShadow').hide();
  },

  addResearchEntry: function () {
    $('[id$="hfSelectedResearchLogEntryID"]').val('');
    $find($('[id$="reResearchEntry"]').attr('id')).set_html('');
    $('.AddResearchForm').show();
  },

  editResearchEntry: function (btn) {
    //var logEntry = $(btn).parents('[class*="LogEntry"][class!="LogEntryButtons"]');
    var logEntry = $(btn).parents('.LogEntry');
    var reResearchEntry = $find($('[id$="reResearchEntry"]').attr('id'));
    var entryId = logEntry.attr('entryid');
    var contents = logEntry.find('.Contents').html();

    reResearchEntry.set_html(contents);
    $('[id$="hfSelectedResearchLogEntryID"]').val(entryId);
    $('.AddResearchForm').show();
  },

  saveResearchEntry: function () {
  	if (!Page_ClientValidate("SaveResearchEntry")) return false;
    var reResearchEntry = $find($('[id$="reResearchEntry"]').attr('id'));
    var entryId = $('[id$="hfSelectedResearchLogEntryID"]').val();
    var contents = Course.removeTrailingLineBreaks(reResearchEntry.get_html(true));
    var researchTable = $('#divResearchTable');

    if (entryId.length > 0) {
      researchTable.find('[class*="LogEntry"][entryid="' + entryId + '"]').find('.Contents').html(contents);
      Courses.updateResearchLogEntry(entryId, contents, Pbl.researchEntryUpdated, Pbl.savingResearchEntryFailed);
    }
    else {
      var entries = researchTable.find('[class*="LogEntry"]');
      var entryClass = entries.length > 0 ? 'LogEntry LogDivider' : 'LogEntry';
      var logEntry = $('<div class="' + entryClass + '" entryid=""><div class="Contents">' + contents + '</div></div>');
      var buttons = $('<div class="LogEntryButtons" style="display: none"></div>');
      var editButton = $('<img src="Images/Edit.gif" alt="Edit Research Log Entry" title="Edit" style="cursor: pointer" onclick="Pbl.editResearchEntry(this);" />');
      var deleteButton = $('<img src="Images/Delete.gif" alt="Delete Research Log Entry" title="Delete" style="cursor: pointer; margin-left: 5px" onclick="if (confirm(\'Are you sure you want to delete this entry?\')) { Pbl.deleteResearchEntry(this); }" />');

      buttons.append(editButton);
      buttons.append(deleteButton);
      logEntry.append(buttons);
      researchTable.append(logEntry);

      var personId = Global.getQueryStringValue('pid');
      var pblActivityId = $('[id$="hfPblActivityID"]').val();

      Courses.createResearchLogEntry(personId, pblActivityId, contents, Pbl.researchEntrySaved, Pbl.savingResearchEntryFailed);
    }

    Pbl.closeNewResearchEntry();
  },

  savingResearchEntryFailed: function (error) {
    alert('There was an error saving your research entry. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
  },

  researchEntryUpdated: function () {

  },

  researchEntrySaved: function (results) {
    var logEntry = $('#divResearchTable').find('[class*="LogEntry"][entryid=""]');
    logEntry.attr('entryid', results);
    logEntry.find('.LogEntryButtons').show();
  },

  deleteResearchEntry: function (btn) {
    var logEntry = $(btn).parents('.LogEntry');
    var entryId = logEntry.attr('entryid');
    logEntry.remove();
    Courses.deleteResearchLogEntry(entryId, Pbl.researchEntryDeleted, Pbl.deletingResearchEntryFailed);
  },

  deletingResearchEntryFailed: function (error) {
    alert('There was an error deleting your research entry. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
  },

  researchEntryDeleted: function () {

  },

  closeNewResearchEntry: function () {
    $('.AddResearchForm').hide();
  }

};




var PracticePage = {

  checkAnswer: function (btn) {
    var questionContainer = $(btn).parents('.QuestionContainer');
    var divQuestion = questionContainer.find('.Question');
    var answerIndex = questionContainer.find('.HiddenAnswerIndexes').val();
    var answerChoiceControls = divQuestion.find('.AnswerChoiceControl');
    var typeClass = divQuestion.find('.AnswerChoiceControl:first').attr('class');
    var answerType = typeClass.substring(typeClass.indexOf(' ') + 1);
    var correct = false;

    switch (answerType) {
      case 'RadioButton':
        correct = answerChoiceControls.filter(String.format(':eq({0})', parseInt(answerIndex))).find('input:checked').length > 0;
        break;

      case 'DropDown':
        correct = answerChoiceControls.find('option:selected').val() === answerIndex;
        break;
    }

    alert(correct ? 'Nice job.' : 'Please try again.');
  },

  showAnswer: function (btn) {
    var questionContainer = $(btn).parents('.QuestionContainer');
    var divQuestion = questionContainer.find('.Question');
    var answerIndex = questionContainer.find('.HiddenAnswerIndexes').val();
    var answerChoiceControls = divQuestion.find('.AnswerChoiceControl');
    var typeClass = divQuestion.find('.AnswerChoiceControl:first').attr('class');
    var answerType = typeClass.substring(typeClass.indexOf(' ') + 1);

    switch (answerType) {
      case 'RadioButton':
        answerChoiceControls.each(function () {
          $(this).find('input').prop('checked', false);
        });
        answerChoiceControls.filter(String.format(':eq({0})', parseInt(answerIndex))).find('input').prop('checked', true);
        break;

      case 'DropDown':
        answerChoiceControls.find(String.format('option:eq({0})', (parseInt(answerIndex) + 1))).prop('selected', true);
        break;
    }
  },

  clearAnswers: function (btn) {
    var questions = $(btn).parents('.Practice').find('.Question');

    questions.each(function () {
      var q = $(this);
      var answerChoiceControls = q.find('.AnswerChoiceControl');
      var typeClass = q.find('.AnswerChoiceControl:first').attr('class');
      var answerType = typeClass.substring(typeClass.indexOf(' ') + 1);

      switch (answerType) {
        case 'RadioButton':
          answerChoiceControls.each(function () {
            $(this).find('input:checked').removeProp('checked');
          });
          break;

        case 'DropDown':
          answerChoiceControls.find('option:selected').prop('selected', false);
          break;
      }
    });
  }

}




var Quiz = {

	currentQuestion: null,
	repeateHeartbeat: false,

  checkKeycode: function (e, keycode) {
    if (e.ctrlKey && (keycode === 65 || keycode === 67)) {
      Global.cancelEvent(e);
    }
    else {
      Quiz.checkShortcutKey(e, keycode);
    }
  },

  checkShortcutKey: function (e, keycode) {
    var quiz = $('.Quiz');
    var btnNext;

    if (quiz.find('.Main').css('display') !== 'none') {

      //Pressing 'n' or '-->' goes Next
      if (keycode === 78 || keycode === 39) {
        btnNext = quiz.find('.NextButton');
        if (btnNext.css('display') !== 'none') {
          Quiz.goNext(btnNext);
        }
      }

      //Pressing 'b' or '<--' goes Back
      else if (keycode === 66 || keycode === 37) {
        var btnBack = quiz.find('.BackButton');
        if (btnBack.css('display') !== 'none') {
          Quiz.goBack(btnBack);
        }
      }

    }
  },

  checkTeacherLogin: function (btn) {
    try {
      var divQuizApproval = $(btn).parents('.QuizApproval');
      var username = divQuizApproval.find('[id$="txtTeacherUsername"]').val();
      var password = divQuizApproval.find('[id$="txtTeacherPassword"]').val();
      var quizId = $(btn).parents('.Quiz').data('quizid');

      Courses.checkTeacherLogin(username, password, quizId, Quiz.showApprovalResults, Quiz.approvalFailed);
    }
    catch (ex) {
      Course.sendError('Quiz.checkTeacherPassword', ex);
    }
  },

  approvalFailed: function (error) {
    alert('There was an error approving the quiz. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
  },

  showApprovalResults: function (results) {
    var resultsArray = results.split('|');

    if (resultsArray.length === 2) {
      var quizId = resultsArray[0];
      var valid = resultsArray[1];

      var quiz = $('.Quiz[id$="quiz' + quizId + '"]');

      quiz.find('[id$="txtTeacherUsername"]').val('');
      quiz.find('[id$="txtTeacherPassword"]').val('');

      if (valid === 'true') {
        Quiz.load();
      }
      else {
        quiz.find('[id$="lblInvalidLogin"]').show();
      }
    }
  },

  load: function () {
    try {
      var quiz = $('.Quiz');
      quiz.find('.BackButton').hide();
      quiz.find('.ReviewButton').hide();
      quiz.find('.AllPreviousButton').hide();
      quiz.find('.FinishButton').hide();
      quiz.find('.Review').hide();
      $('.AppButtons').hide();
      $('.BackNext').hide();
      $('.DivBackTablet').hide();
      $('.DivNextTablet').hide();
      quiz.find('.Stats').hide();
      quiz.find('[id$="lblInvalidLogin"]').hide();
      quiz.find('.NextButton').show();
      quiz.find('.Main').show();
      //quiz.find('.Questions').show();
    }
    catch (ex) {
      Course.sendError('Quiz.load', ex);
    }
  },

  blurRadio: function (rb) {
    try {
      $(rb).parents('.QuestionUnanswered').attr('class', 'Question');
      $(rb).parents('.Quiz').find('.NextButton').focus();
    }
    catch (ex) {
      Course.sendError('Quiz.blurRadio', ex);
    }
  },

  goNext: function (btnNext) {
  	Common.heartbeat();
    try {
      var quiz = $(btnNext).parents('.Quiz');
      var nextGroup;

      quiz.find('.QuestionGroup').each(function () {
        var group = $(this);

        if (group.css('display') !== 'none') {
          group.hide();
          nextGroup = group.next('.QuestionGroup');
          return;
        }
      });

      if (typeof (nextGroup) !== 'undefined' && nextGroup.length === 1) {
        $('[id$="hfCurrentGroupNumber"]').val(nextGroup.data('groupnumber'));
        nextGroup.show();
        quiz.find('.BackButton').show();
        quiz.find('.AllPreviousButton').show();
      }
      else {
        quiz.find('.BackButton').hide();
        $(btnNext).hide();
        quiz.find('.AllPreviousButton').hide();

        $('[id$="hfCurrentGroupNumber"]').val(0);

        if (Quiz.checkAllQuestionsAnswered(quiz.find('.Question'))) {
          quiz.find('.Review').html('You answered all the questions. To change your answers, click the "All Previous" button, or to finish the quiz, click "Finish".').show();
          quiz.find('.ReviewButton').show();
          quiz.find('.FinishButton').removeAttr('disabled').show();
        }
        else {
          quiz.find('.Review').html('You have not answered all the questions. You must answer all the questions to complete the quiz and receive a grade. Please click on the "All Previous" button below to review and answer any unanswered questions (unanswered questions will be highlighted).').show();
          quiz.find('.FinishButton').hide();
          quiz.find('.ReviewButton').show();
        }
      }
    }
    catch (ex) {
      Course.sendError('Quiz.goNext', ex);
    }
  },

  goBack: function (btnBack) {
  	Common.heartbeat();
    try {
      var quiz = $(btnBack).parents('.Quiz');

      quiz.find('.QuestionGroup').each(function () {
        var group = $(this);

        if (group.css('display') !== 'none') {
          group.hide();
          var previousGroup = group.prev('.QuestionGroup');
          var previousGroupNumber = parseInt(previousGroup.data('groupnumber'));
          $('[id$="hfCurrentGroupNumber"]').val(previousGroup.data('groupnumber'));
          previousGroup.show();

          if (previousGroupNumber <= 1) {
            $(btnBack).hide();
            quiz.find('.AllPreviousButton').hide();
          }

          return;
        }
      });
    }
    catch (ex) {
      Course.sendError('Quiz.goBack', ex);
    }
  },

  showAllPrevious: function (btn) {
  	try {
  		Common.heartbeat();
      var quiz = $(btn).parents('.Quiz');
      var currentGroupNumber = null;

      if ($(btn).attr('class') === 'AllPreviousButton') {
        currentGroupNumber = parseInt($('[id$="hfCurrentGroupNumber"]').val());
      }

      quiz.find('.Review').hide();
      quiz.find('.NextButton').hide();
      quiz.find('.BackButton').hide();
      quiz.find('.ReviewButton').hide();
      quiz.find('.AllPreviousButton').hide();
      quiz.find('.FinishButton').hide();
      quiz.find('.AllPreviousNextButton').show();
      quiz.find('.Groups').css('margin-top', '50px');

      quiz.find('.Question').each(function () {
        var question = $(this);
        var group = question.parents('.QuestionGroup');

        if (currentGroupNumber == null || parseInt(group.data('groupnumber')) < currentGroupNumber) {
          var answered = question.find('.AnswerControl:checked').length > 0;
          question.attr('class', answered ? 'Question' : 'QuestionUnanswered');
          group.show();
        }
      });
      quizAllPrevShowing();
    }
    catch (ex) {
      Course.sendError('Quiz.showAllPrevious', ex);
    }
  },

  hideAllPrevious: function (btn) {
  	try {
  		Common.heartbeat();
      var quiz = $(btn).parents('.Quiz');
      var lblReview = quiz.find('.Review');
      var questions = quiz.find('.Question,.QuestionUnanswered');
      var currentGroupNumber = parseInt($('[id$="hfCurrentGroupNumber"]').val());

      quiz.find('.AllPreviousNextButton').hide();
      quiz.find('.Groups').css('margin-top', '5px');
      quiz.find('.QuestionUnanswered').attr('class', 'Question');

      questions.each(function () {
        var question = $(this);
        var group = question.parents('.QuestionGroup');

        if (currentGroupNumber != null && parseInt(group.data('groupnumber')) === currentGroupNumber) {
          group.show();
        }
        else {
          group.hide();
        }
      });

      if (currentGroupNumber === 0) {
        lblReview.show();

        if (Quiz.checkAllQuestionsAnswered(quiz.find('.Question'))) {
          lblReview.html('You answered all the questions. To change your answers, click the "All Previous" button, or to finish the quiz, click "Finish".');
          quiz.find('.FinishButton').removeAttr('disabled').show();
        }
        else {
          lblReview.html('You have not answered all the questions. You must answer all the questions to complete the quiz and receive a grade. Please click on the "All Previous" button below to review and answer any unanswered questions (unanswered questions will be highlighted).');
        }

        quiz.find('.ReviewButton').show();
      }
      else {
        quiz.find('.NextButton').show();
        if (currentGroupNumber > 1) {
          quiz.find('.BackButton').show();
          quiz.find('.AllPreviousButton').show();
        }
        else {
          quiz.find('.BackButton').hide();
          quiz.find('.AllPreviousButton').hide();
        }
      }
    }
    catch (ex) {
      Course.sendError('Quiz.hideAllPrevious', ex);
    }
  },

  checkAllQuestionsAnswered: function (questions) {
    try {
      var questionsAnswered = 0;

      $(questions).each(function () {
        var checked = $(this).has('.AnswerControl:checked');
        if (checked.length > 0) {
          questionsAnswered += 1;
          return;
        }
      });

      return questionsAnswered === questions.length;
    }
    catch (ex) {
      Course.sendError('Quiz.checkAllQuestionsAnswered', ex);
    }

    return false;
  },

  finish: function (btn) {
    try {
      $(btn).attr('disabled', 'disabled');

      var quiz = $(btn).parents('.Quiz');
      var answerString = '';

      var questions = quiz.find('.Question');
      var maxQ = questions.length;

      if (maxQ > 0) {
        var answers = new Array(maxQ);

        questions.each(function (i) {
          var q = $(this);
          answers[i] = new Array(2);
          var rb = q.find('.AnswerControl:checked');
          if (rb.length === 1) {
            answers[i][0] = parseInt(rb.parents('.Question').data('questionnumber'));
            answers[i][1] = parseInt(rb.data('answernumber')) - 1;
          }
        });

        answers.sort(function (a, b) { return a[0] - b[0] });

        for (var i = 0; i < answers.length; i++) {
          answerString += ',' + answers[i][1].toString();
        }

        answerString = answerString.length > 1 ? answerString.substring(1) : '';

        var personId = Global.getQueryStringValue('pid');
        var quizId = quiz.attr('id');
        quizId = quizId.length > 4 ? quizId.substring(4) : '';
        var courseVersionId = Global.getQueryStringValue('courseVersionId');
        var unit = Global.getQueryStringValue('unit');

        if (personId !== '' && quizId !== '' && courseVersionId !== '' && unit !== '' && answerString !== '') {
          Courses.saveQuizScore(personId, courseVersionId, unit, quizId, answerString, Quiz.showResults, Quiz.saveFailed);
        }
        else {
          Course.sendError('Quiz.finish', 'input parameter values: PersonID ' + personId + ', CourseVersionID ' + courseVersionId + ', Unit ' + unit + ', QuizID ' + quizId + ', AnswerString ' + answerString);
          alert('There was an error saving your quiz.');
          location.reload(true);
        }
      }
      else {
        Course.sendError('Quiz.finish', 'questions.length <= 0');
        alert('There was an error saving your quiz.');
        location.reload(true);
      }
    }
    catch (ex) {
      Course.sendError('Quiz.finish', ex);
      alert('There was an error saving your quiz.');
      location.reload(true);
    }
  },

  saveFailed: function (error) {
    alert('There was an error saving your quiz. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
  },

  showResults: function () {
    try {
      location.reload(true);
    }
    catch (ex) {
      Course.sendError('Quiz.showResults', ex);
    }
  },

  countdown: function (seconds, ctrlId, intervalContainer, lblRetake) {
    try {
      var minutes = Math.floor(seconds / 60);
      var secs = Math.floor(seconds % 60);

      if (minutes >= 0 && seconds >= 0) {
        var timeString = minutes.toString() + ':' + (secs < 10 ? '0' : '') + secs.toString();
        $('#' + ctrlId).html(timeString);
        setTimeout('Quiz.countdown(' + (seconds - 1) + ', "' + ctrlId + '", "' + intervalContainer + '", "' + lblRetake + '")', 1000);
      }
      else {
        $('#' + intervalContainer).hide();
        $('#' + lblRetake).show();
      }
    }
    catch (ex) {
      Course.sendError('Quiz.countdown', ex);
    }
  },

  toggleAttempt: function (link) {
    link = $(link);
    var parentDiv = link.parents('.AttemptItem');
    var divDetail = parentDiv.find('.AttemptDetail');
    var divNoConcepts = parentDiv.find('.AttemptNoConcepts');
    var divScore = parentDiv.find('.AttemptScore');
    divScore.toggle();
    if (divScore.html().indexOf("100%") >= 0) {
      divNoConcepts.toggle();
    }
    else {
      divDetail.toggle();
    }
  }

};



var MatchingActivity = {

  selectItem: function (item) {
    item = $(item);
    var activity = item.parents('.MatchingActivity');
    var itemContainer = item.parents('[class$="ItemContainer"]');
    var parentColumn = itemContainer.hasClass('LeftColumn') ? 'LeftColumn' : 'RightColumn';
    var otherColumn = parentColumn === 'LeftColumn' ? 'RightColumn' : 'LeftColumn';
    var otherContainer = activity.find('[class^="' + otherColumn + '"]');
    var otherSelectedItem = otherContainer.find('[class*="SelectedMatchItem"]');

    itemContainer.find('[class*="SelectedMatchItem"]').removeClass('SelectedMatchItem');

    if (otherSelectedItem.length === 1) {
      var pair = parentColumn === 'LeftColumn' ? item.attr('pair') : otherSelectedItem.attr('pair');
      var canvas = activity.find('[id="canvas' + pair + '"]');
      var context = canvas.get(0).getContext('2d');

      var itemMatchPair = item.attr('matchPair');
      var otherItemMatchPair = otherSelectedItem.attr('matchPair');
      var otherCanvas, otherContext;

      if (parentColumn === 'RightColumn' && typeof (itemMatchPair) !== 'undefined') {
        otherCanvas = activity.find('[id="canvas' + itemMatchPair + '"]');
        otherContext = otherCanvas.get(0).getContext('2d');
        otherContext.clearRect(0, 0, 200, 600);
        otherContainer.find('[class*="MatchItem"][pair="' + itemMatchPair + '"]').removeAttr('matchPair');
        itemContainer.find('[class*="MatchItem"][pair="' + otherItemMatchPair + '"]').removeAttr('matchPair');
      }
      else if (typeof (otherItemMatchPair) !== 'undefined') {
        otherCanvas = activity.find('[id="canvas' + otherItemMatchPair + '"]');
        otherContext = otherCanvas.get(0).getContext('2d');
        otherContext.clearRect(0, 0, 200, 600);
        itemContainer.find('[class*="MatchItem"][pair="' + otherItemMatchPair + '"]').removeAttr('matchPair');
        otherContainer.find('[class*="MatchItem"][pair="' + itemMatchPair + '"]').removeAttr('matchPair');
      }

      var itemY = MatchingActivity.findRelY(item.get(0)) + 45;
      var otherItemY = MatchingActivity.findRelY(otherSelectedItem.get(0)) + 45;

      var y1 = parentColumn === 'LeftColumn' ? itemY : otherItemY;
      var y2 = parentColumn === 'LeftColumn' ? otherItemY : itemY;

      context.clearRect(0, 0, 200, 600);
      context.beginPath();
      context.moveTo(0, y1);
      context.lineTo(200, y2);
      context.strokeStyle = '#000000';
      context.stroke();

      item.attr('matchPair', otherSelectedItem.attr('pair'));
      otherSelectedItem.attr('matchPair', item.attr('pair'));
      otherContainer.find('[class*="SelectedMatchItem"]').removeClass('SelectedMatchItem');
    }
    else {
      item.addClass('SelectedMatchItem');
    }
  },

  findRelY: function (obj) {
    return $(obj).attr('itemIndex') * 100;
  },

  checkAnswers: function (saveActivity) {
    try {
      var composer = Global.getQueryStringValue('composer');
      MatchingActivity.score(saveActivity && (composer == null || composer == ''));
      $('.CourseContent').scrollTop(0);
    }
    catch (ex) {
      Course.sendError('MatchingActivity.checkAnswers', ex);
    }
  },

  score: function (saveActivity) {
    var divScore = $('.ActivityScore');
    var correctAnswers = 0;
    var activity = $('.MatchingActivity');
    var leftColumn = activity.find('[class^="LeftColumn"]');
    var rightColumn = activity.find('[class^="RightColumn"]');
    var leftItems = leftColumn.find('[class*="MatchItem"]');
    var rightItems = rightColumn.find('[class*="MatchItem"]');

    leftItems.each(function () {
      var item = $(this);
      var pair = item.attr('pair');
      var matchPair = item.attr('matchPair');

      var canvas = activity.find('[id="canvas' + pair + '"]');
      var context = canvas.get(0).getContext('2d');

      item.removeClass('CorrectMatch').removeClass('IncorrectMatch');

      if (typeof (matchPair) !== 'undefined') {
        var correct = pair === matchPair;
        var otherItem = rightColumn.find('[class*="MatchItem"][pair="' + matchPair + '"]');

        var y1 = MatchingActivity.findRelY(item.get(0)) + 45;
        var y2 = MatchingActivity.findRelY(otherItem.get(0)) + 45;

        context.clearRect(0, 0, 200, 600);
        context.beginPath();
        context.moveTo(0, y1);
        context.lineTo(200, y2);
        context.strokeStyle = correct ? 'Green' : 'Red';
        context.stroke();

        item.addClass(correct ? 'CorrectMatch' : 'IncorrectMatch');

        correctAnswers += correct ? 1 : 0;
      }
      else {
        item.removeClass('CorrectMatch');
        item.addClass('IncorrectMatch');
      }
    });

    rightItems.each(function () {
      var item = $(this);
      var matchPair = item.attr('matchPair');
      item.removeClass('CorrectMatch').removeClass('IncorrectMatch');
      item.addClass(typeof (matchPair) !== 'undefined' && item.attr('pair') === matchPair ? 'CorrectMatch' : 'IncorrectMatch');
    });

    var intScore = Math.round((correctAnswers / leftItems.length) * 100);
    var score = String(intScore);
    divScore.attr('class', intScore >= 60 ? 'ActivityScore Pass' : 'ActivityScore Fail').html('Score: ' + score + '%');

    if (saveActivity) {
      var activityId = $('.ActivityContainer').attr('id').substring(8);
      var selectedAnswers = '';

      activity = $('.MatchingActivity');
      leftColumn = activity.find('[class^="LeftColumn"]');
      leftItems = leftColumn.find('[class*="MatchItem"]');

      leftItems.each(function () {
        var item = $(this);
        var pair = item.attr('pair');
        var matchPair = item.attr('matchPair');

        matchPair = typeof (matchPair) === 'undefined' ? '-1' : matchPair;

        selectedAnswers += ';{' + pair + ',' + matchPair + '}';
      });

      selectedAnswers = selectedAnswers.length > 0 ? selectedAnswers.substring(1) : '';

      var personId = Global.getQueryStringValue('pid');
      var courseVersionId = Global.getQueryStringValue('courseVersionId');
      var unit = Global.getQueryStringValue('unit');

      if (personId !== '' && courseVersionId !== '' && unit !== '' && activityId !== '' && selectedAnswers !== '' && intScore >= 0 && intScore <= 100 && score !== '') {
        Courses.saveMatchingActivityAttempt(personId, courseVersionId, unit, activityId, selectedAnswers, score, MatchingActivity.showSaveResults, MatchingActivity.saveFailed);
      }
      else {
        alert('There was an error saving your activity. Please reload the page and try again. If the problem persists, please contact the Cyber High office.');
      }
    }
  },

  showSaveResults: function () {

  },

  saveFailed: function () {
    alert('There was an error saving your activity. Please refresh the page and try again. If the problem persists, please contact Cyber High support.');
  },

  clearAnswers: function () {
    var activity = $('.MatchingActivity');
    var leftColumn = activity.find('[class^="LeftColumn"]');
    var rightColumn = activity.find('[class^="RightColumn"]');
    var leftItems = leftColumn.find('[class*="MatchItem"]');
    var rightItems = rightColumn.find('[class*="MatchItem"]');

    $('.ActivityScore').html('');

    leftItems.each(function () {
      var item = $(this);
      var pair = item.attr('pair');
      var canvas = activity.find('[id="canvas' + pair + '"]');
      var context = canvas.get(0).getContext('2d');
      context.clearRect(0, 0, 200, 600);
      item.removeAttr('matchPair');
      item.removeClass('CorrectMatch').removeClass('IncorrectMatch');
    });

    rightItems.each(function () {
      var item = $(this);
      item.removeAttr('matchPair');
      item.removeClass('CorrectMatch').removeClass('IncorrectMatch');
    });
  }

};




var WordGroupsActivity = {

	init: function (readOnly) {
		readOnly = typeof readOnly !== 'undefined' ? readOnly : false;

		var workspace = $('.WordGroupsWorkspace');
		if (!readOnly) {
			workspace.find('.WordCard').each(function () {
				var card = $(this);

				card.draggable({
    				scroll: false,
    				cursor: 'default',
    				stack: '.WordCard',
    				start: function () { WordGroupsActivity.dragStart(this); }
				});
			});
		};

		workspace.find('[class^="Group"]').each(function () {
		var group = $(this);
		var groupId = group.attr('groupID');

		group.droppable({
			accept: '.WordCard',
			drop: function (event, ui) { WordGroupsActivity.dropCard(event, ui, groupId); }
		});
		});

		WordGroupsActivity.shuffleCards();
	},

	shuffleCards: function () {
		$('.WordGroupsWorkspace').find('.WordCard').each(function () {
			var card = $(this);
			var selectedGroup = card.attr('selectedgroup');
			var coords = typeof selectedGroup !== 'undefined' && selectedGroup != null && selectedGroup.length > 0 ? WordGroupsActivity.generateGroupCoords(selectedGroup) : WordGroupsActivity.generateCoords();
			var top = coords[1];
			var left = coords[0];
			$(this).css('top', String(top) + 'px').css('left', String(left) + 'px').show();
		});
	},

	generateGroupCoords: function (selectedGroup) {
		var cards = $('.WordCard[selectedgroup="' + selectedGroup + '"]');
		selectedGroup = parseInt(selectedGroup);
		var coords = new Array();
		//Left
		coords[0] = $('.Group[groupid="' + selectedGroup + '"]').hasClass('RightGroup') ? 337 : -317;
		
		//Top
		coords[1] = $('.Group[groupid="' + selectedGroup + '"]').position().top + 10;
		

		return WordGroupsActivity.indentCards(cards, coords);
	},

	indentCards: function (cards, coords) {
		cards.each(function () {
			var card = $(this);

			if (parseInt(card.css('left').replace('px', '')) === coords[0]) {
				coords[0] += 20;
				WordGroupsActivity.indentCards(cards, coords);
				return false;
			}
		});

		return coords;
	},

	generateCoords: function () {
		var x = Math.floor(Math.random() * 140);
		var y = Math.floor(Math.random() * 473);
		var coords = new Array();

		coords[0] = x;
		coords[1] = y;
		return coords;
	},

	dragStart: function (card) {
		$(card).data('dropped', false);
	},

	dropCard: function (e, ui, groupId) {
		var card = ui.draggable;
		card.attr('selectedgroup', groupId);
		card.data('dropped', true);
	},

	checkAnswers: function (save) {
		var workspace = $('.WordGroupsWorkspace');
		var groups = workspace.find('[class^="Group"]');
		var cards = workspace.find('.WordCard');
		var incorrectGroups = new Array();
		var divScore = $('.ActivityScore');
		var correctAnswers = 0;
		var composer = Global.getQueryStringValue('composer');
		var correctCards = new Array();
		var incorrectCards = new Array();

		cards.each(function () {
			var card = $(this);
			var group = card.attr('groupID');
			var selectedGroup = card.attr('selectedgroup');

			if (!save && selectedGroup.length > 0) {
				card.data('dropped', true);
			}

			if (!card.data('dropped') && $.inArray(group, incorrectGroups) === -1) { //If card isn't dropped into any group && card's group isn't already in theincorrectGroups array, then add it to theincorrectGroups array
				incorrectGroups.push(group);
			}

			if (card.data('dropped') && group === selectedGroup) {
				correctCards.push(card);
			}
			else {
				incorrectCards.push(card);
			}

			if (card.data('dropped') && group !== selectedGroup) { //If card is dropped into a group and the card's correct group & current group don't match, then add it to theincorrectGroups array
				if ($.inArray(group, incorrectGroups) === -1) {
					incorrectGroups.push(group);
				}

				if ($.inArray(selectedGroup, incorrectGroups) === -1) {
					incorrectGroups.push(selectedGroup);
				}
			}

		});

		for (var i = 0; i < incorrectGroups.length; i++) {
		var groupID = incorrectGroups[i];
		var group = groups.filter('[groupID="' + groupID + '"]');
		group.removeClass('WordContainerCorrect');
		group.addClass('WordContainerIncorrect');
		}

		groups.each(function () {
		var group = $(this);
		var groupID = group.attr('groupID');

		if ($.inArray(groupID, incorrectGroups) === -1) {
			group.removeClass('WordContainerIncorrect');
			group.addClass('WordContainerCorrect');
			correctAnswers += 1;
		}
		});

		//Mark correct cards as correct
		for (var i = 0; i < correctCards.length; i++) {
			correctCards[i].addClass('WordCardCorrect');
			correctCards[i].removeClass('WordCardIncorrect');
		}

		//Mark incorrect cards as incorrect
		for (var i = 0; i < incorrectCards.length; i++) {
			incorrectCards[i].addClass('WordCardIncorrect');
			incorrectCards[i].removeClass('WordCardCorrect');
		}

		//Calculate score based on the number of cards that are in the correct group
		var intScore = Math.round((correctCards.length / (incorrectCards.length + correctCards.length)) * 100);
		var score = String(intScore);
		divScore.attr('class', intScore >= 60 ? 'ActivityScore Pass' : 'ActivityScore Fail').html('Score: ' + score + '%');
		if (save && (composer == null || composer == '')) {
		var activityId = $('.ActivityContainer').attr('id').substring(8);
		var personId = Global.getQueryStringValue('pid');
		var courseVersionId = Global.getQueryStringValue('courseVersionId');
		var unit = Global.getQueryStringValue('unit');
		var xml = '<wordgroups>';

		groups.each(function () {
			var group = $(this);
			var groupId = group.attr('groupid');
			var title = group.find('legend').text();

			var groupCards = workspace.find('.WordCard[selectedgroup="' + groupId + '"]');;

			xml += String.format('<group title="{0}" groupid="{1}">', title, groupId);

			groupCards.each(function () {
				var cardIsCorrect = group.hasClass('WordContainerCorrect');
				var card = $(this);
				var type = card.find('img').length > 0 ? 'image' : 'text';
				var cardGroupId = card.attr('groupID');
				var td = card.find('td');
				var content;

				if (type === 'image') {
				var img = td.find('img');
				var src = img.attr('src').split('\\').pop().split('/').pop();  //strip path
				var alt = img.attr('alt');
				var w = img.css('width');
				var h = 'height';

				content = String.format('<image src="{0}" alt="{1}" width="{2}" height="{3}" />', src, alt, w, h);
				}
				else {
					content = td;
					while (content.children().length > 0) {
						content = content.find('div');
					}
					content = content.html();
				}

				xml += String.format('<word type="{0}" groupid="{1}" selectedgroup="{2}">{3}</word>', type, cardGroupId, groupId, content);
			});

			cards.each(function() {
				var card = $(this);
				var cardGroupId = card.attr('groupID');
				var selectedGroup = card.attr('selectedgroup');
				var type = card.find('img').length > 0 ? 'image' : 'text';
				var td = card.find('td');
				var content;

				if (type === 'image') {
				var img = td.find('img');
				var src = img.attr('src').split('\\').pop().split('/').pop();  //strip path
				var alt = img.attr('alt');
				var w = img.css('width');
				var h = 'height';

				content = String.format('<image src="{0}" alt="{1}" width="{2}" height="{3}" />', src, alt, w, h);
				}
				else {
					content = td;
					while (content.children().length > 0) {
						content = content.find('div');
					}
					content = content.html();
				}

				if ((selectedGroup == null || selectedGroup === '') && cardGroupId === groupId) {
				xml += String.format('<word type="{0}" groupid="{1}" selectedgroup="">{2}</word>', type, cardGroupId, content);
				}
			});

			xml += '</group>';
		});

		xml += '</wordgroups>';

		Courses.saveWordGroupsActivity(personId, courseVersionId, unit, activityId, xml, score, WordGroupsActivity.saveComplete, WordGroupsActivity.saveFailed);
		}
	},

	saveFailed: function (error) {
		alert('There was an error saving your activity. Please refresh the page and try again. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
	},

	saveComplete: function () {
	},

	clearAnswers: function () {
		var workspace = $('.WordGroupsWorkspace');
		var groups = workspace.find('[class^="Group"]');
		var cards = workspace.find('.WordCard');

		$('.ActivityScore').removeClass('Pass').removeClass('Fail').html('');

		groups.each(function () {
		$(this).removeClass('WordContainerCorrect').removeClass('WordContainerIncorrect');
		});

		cards.each(function () {
			$(this).attr('selectedgroup', '').data('dropped', false);
			$(this).removeClass('WordCardCorrect');
			$(this).removeClass('WordCardIncorrect');
		});

		WordGroupsActivity.shuffleCards();
	}

};




var RetellingActivity = {

  init: function () {
    var leftColumn = $('.LeftFragments');
    var sentenceContainer = $('[class^="SentenceContainer"]');
    leftColumn.css('height', sentenceContainer.get(0).offsetHeight + 'px');

    $('.LeftFragment,.RightFragment').each(function () {
      $(this).draggable({
        scroll: false,
        cursor: 'default'
      });
    });

    $('.DropTarget').each(function () {
      var target = $(this);
      var targetId = target.attr('id');

      target.droppable({
        accept: '.LeftFragment,.RightFragment',
        drop: function (event, ui) { RetellingActivity.dropFragment(event, ui, targetId); }
      });
    });

    $('.SentenceContainer').sortable().disableSelection();
  },

  dropFragment: function (event, ui, targetId) {
    var target = $('[id="' + targetId + '"]');
    var fragment = ui.draggable;
    var order = fragment.attr('order');
    var left = fragment.hasClass('LeftFragment');
    var span = $(String.format('<span>{0}{1}</span>', left ? '' : ' ', fragment.html()));
    var accept;

    span.attr('order', order);
    span.attr('scrambledOrder', fragment.attr('scrambledOrder'));
    fragment.remove();

    if (left) {
      target.prepend(span);

      accept = target.droppable('option', 'accept').replace('.LeftFragment', '');

      if (accept.indexOf('RightFragment') > -1) {
        target.droppable('option', 'accept', '.RightFragment');
      }
      else {
        target.droppable('option', 'disabled', true);
      }
    }
    else {
      target.append(span);

      accept = target.droppable('option', 'accept').replace('.RightFragment', '');

      if (accept.indexOf('LeftFragment') > -1) {
        target.droppable('option', 'accept', '.LeftFragment');
      }
      else {
        target.droppable('option', 'disabled', true);
      }
    }
  },

  checkAnswers: function (save) {
    var targets = $('[class*="DropTarget"]');
    var fragmentsXml = '<left>';
    var targetCount = targets.length;
    var incorrectSentences = new Array();
    var divScore = $('.ActivityScore');
    var composer = Global.getQueryStringValue('composer');

    targets.each(function (i) {
      var target = $(this);
      var fragment = target.find('span:first');
      var order = fragment.attr('order');
      var selectedTarget = String(i + 1);

      fragmentsXml += '<fragment order="' + order + '" selectedtarget="' + selectedTarget + '">' + fragment.html() + '</fragment>';
      target.removeClass('DropTargetInCorrect');
      target.removeClass('DropTargetCorrect');
      target.addClass('DropTargetCorrect');

      if (order !== selectedTarget) {
        incorrectSentences.push(selectedTarget);
        target.removeClass('DropTargetCorrect');
        target.addClass('DropTargetIncorrect');
      }
    });

    fragmentsXml += '</left><right>';

    targets.each(function (i) {
      var target = $(this);
      var fragment = target.find('span:last');
      var order = fragment.attr('order');
      var selectedTarget = String(i + 1);

      fragmentsXml += '<fragment order="' + order + '" selectedtarget="' + selectedTarget + '">' + fragment.html() + '</fragment>';

      if (order !== selectedTarget && $.inArray(selectedTarget, incorrectSentences) === -1) {
        incorrectSentences.push(selectedTarget);
        target.removeClass('DropTargetCorrect');
        target.addClass('DropTargetIncorrect');
      }
    });

    fragmentsXml += '</right>';

    var correctAnswers = targetCount - incorrectSentences.length;
    var intScore = Math.round((correctAnswers / targetCount) * 100);
    var score = String(intScore);
    divScore.attr('class', intScore >= 60 ? 'ActivityScore Pass' : 'ActivityScore Fail').html('Score: ' + score + '%');

    if (save && composer == null) {
      var activityId = $('.ActivityContainer').attr('id').substring(8);
      var personId = Global.getQueryStringValue('pid');
      var courseVersionId = Global.getQueryStringValue('courseVersionId');
      var unit = Global.getQueryStringValue('unit');

      Courses.saveRetellingActivity(personId, courseVersionId, unit, activityId, fragmentsXml, score, RetellingActivity.saveComplete, RetellingActivity.saveFailed);
    }
  },

  saveFailed: function (error) {
    alert('There was an error saving your activity. Please refresh the page and try again. If the problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
  },

  saveComplete: function () {

  },

  clearAnswers: function () {
    var leftColumn = $('.LeftFragments');
    var rightColumn = $('.RightFragments');
    var targets = $('[class*="DropTarget"]');
    var leftFragments = targets.find('span:first');
    var rightFragments = targets.find('span:last');
    var sentenceCount = leftFragments.length;
    var sentenceContainer = $('[class^="SentenceContainer"]');

    for (var i = 1; i <= sentenceCount; i++) {
      var leftFragment = leftFragments.filter('[scrambledOrder="' + i.toString() + '"]');
      var rightFragment = rightFragments.filter('[scrambledOrder="' + i.toString() + '"]');
      var leftOrder = leftFragment.attr('order');
      var rightOrder = rightFragment.attr('order');

      leftColumn.append($('<div id="leftFragment' + leftOrder + '" class="LeftFragment" order="' + leftOrder + '" scrambledOrder="' + i.toString() + '">' + leftFragment.html() + '</div>'));
      rightColumn.append($('<div id="rightFragment' + rightOrder + '" class="RightFragment" order="' + rightOrder + '" scrambledOrder="' + i.toString() + '">' + rightFragment.html() + '</div>'));

      leftFragment.remove();
      rightFragment.remove();
    }

    targets.each(function () {
      var target = $(this);
      target.removeClass('DropTargetCorrect').removeClass('DropTargetIncorrect');
      target.droppable('option', 'accept', '.LeftFragment,.RightFragment');
      target.droppable('option', 'disabled', false);
    });

    $('.ActivityScore').removeClass('Pass').removeClass('Fail').html('');

    leftColumn = $('.LeftFragments');
    leftColumn.css('height', sentenceContainer.get(0).offsetHeight + 'px');

    $('.LeftFragment,.RightFragment').each(function () {
      $(this).draggable({
        scroll: false,
        cursor: 'default'
      });
    });
  }

};




var FixSentencesActivity = {

  checkAnswers: function (save) {
    var questions = $('.Question');
    var questionsXml = '<questions>';
    var composer = Global.getQueryStringValue('composer');

    questions.each(function () {
      var question = $(this);
      var sentence = question.find('.Sentence');
      var correctSentence = question.find('.Correct');

      sentence.removeClass('SentenceCorrect');
      sentence.removeClass('SentenceIncorrect');
      sentence.addClass(sentence.val().trim() === correctSentence.val().trim() ? 'SentenceCorrect' : 'SentenceIncorrect');

      questionsXml += '<question>';
      questionsXml += sentence.val();
      questionsXml += '</question>';
    });


    $('.FixSentencesAudio').removeClass('SentenceIncorrect');
    $('.FixSentencesAudio').removeClass('SentenceCorrect');

    questionsXml += '</questions>';
    var correctAnswers = questions.length - $('[class*="SentenceIncorrect"]').length;
    var intScore = Math.round((correctAnswers / questions.length) * 100);
    var score = String(intScore);
    $('.ActivityScore').attr('class', intScore >= 60 ? 'ActivityScore Pass' : 'ActivityScore Fail').html('Score: ' + score + '%');

    if (save && (composer == null || composer == '')) {
      var activityId = $('.ActivityContainer').attr('id').substring(8);
      var personId = Global.getQueryStringValue('pid');
      var courseVersionId = Global.getQueryStringValue('courseVersionId');
      var unit = Global.getQueryStringValue('unit');

      Courses.saveFixSentencesActivity(personId, courseVersionId, unit, activityId, questionsXml, score, FixSentencesActivity.saveComplete);
    }
  },

  saveComplete: function (results) {
    if (results !== 'success') {
      alert('There was an error saving your activity. Please refresh the page and try again. If the problem persists, please contact Cyber High support.');
    }
  },

  clearAnswers: function () {
    var questions = $('.Question');

    questions.each(function () {
      var question = $(this);
      var sentence = question.find('[class*="Sentence"]');
      var incorrectSentence = question.find('.Incorrect');

      sentence.removeClass('SentenceCorrect');
      sentence.removeClass('SentenceIncorrect');
      sentence.val(incorrectSentence.html());
    });

    $('.ActivityScore').removeClass('Pass').removeClass('Fail').html('');
  }

};



var ReadingComprehensionActivity = {

  checkAnswers: function (save) {
    var questions = $('.Question');
    var correctAnswers = 0;
    var selectedAnswers = '';
    var composer = Global.getQueryStringValue('composer');

    questions.each(function () {
      var question = $(this);
      var grade = question.find('.Grade');
      var answerIndex = parseInt(question.data('answerindex'));
      var selectedAnswer = question.find('.Answer').find('input[type="radio"]:checked');
      var selectedIndex = selectedAnswer.length ? selectedAnswer.val() : '-1';
      var correct = question.find('.Answer:nth-child(' + String(answerIndex + 1) + ')').find('input[type="radio"]:checked').length;

      selectedAnswers += (selectedAnswers.length > 0 ? ',' : '') + selectedIndex;
      correctAnswers += correct ? 1 : 0;
      grade.attr('src', correct ? 'Images/GreenCheck24.gif' : 'Images/RedX24.gif');
      grade.attr('title', correct ? 'Correct Answer' : 'Incorrect Answer');
      grade.show();
    });

    var intScore = Math.round((correctAnswers / questions.length) * 100);
    var score = String(intScore);
    $('.ActivityScore').attr('class', intScore >= 60 ? 'ActivityScore Pass' : 'ActivityScore Fail').html('Score: ' + score + '%');

    if (save && composer == null) {
      var activityId = $('.ActivityContainer').attr('id').substring(8);
      var personId = Global.getQueryStringValue('pid');
      var courseVersionId = Global.getQueryStringValue('courseVersionId');
      var unit = Global.getQueryStringValue('unit');

      Courses.saveReadingComprehensionActivity(personId, courseVersionId, unit, activityId, selectedAnswers, score, ReadingComprehensionActivity.saveComplete, ReadingComprehensionActivity.saveFailed);
    }
  },

  saveFailed: function (error) {
    alert('There was an error saving your activity. If this problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
  },

  saveComplete: function () {

  },

  clearAnswers: function () {
    $('.Grade').hide();
    $('input[type="radio"]:checked').removeProp('checked');
    $('.ActivityScore').removeClass('Pass').removeClass('Fail').html('');
  },

  highlightParagraph: function (btn) {
    var question = $(btn).parents('.Question');
    var paragraphNumber = question.data('paragraphnumber');
    var paragraph = $('.PassageParagraph[data-paragraphnumber="' + paragraphNumber + '"]');
    paragraph.css('background-color', '#aacf38');
    paragraph.animate({ 'background-color': 'transparent' }, 5000);
  }

};



var ReorderParagraphsActivity = {
  
  init: function () {
    $('.ParagraphsContainer').sortable({
      items: '.ParagraphControl'
    }).disableSelection();
  },

  checkAnswers: function (save) {
    var paragraphs = $('.ParagraphsContainer').find('.ParagraphControl');
    var correctAnswers = 0;
    var xml = '<paragraphs>';
    var composer = Global.getQueryStringValue('composer');

    paragraphs.each(function(i) {
      var paragraph = $(this);

      if ((i + 1) === parseInt(paragraph.data('ordinal'))) {
      	paragraph.removeClass('Incorrect');
      	paragraph.addClass('Correct');
        correctAnswers += 1;
      }
      else {
        paragraph.addClass('Incorrect');
        paragraph.removeClass('Correct');
	}

      xml += '<paragraph data-ordinal="' + paragraph.data('ordinal') + '">' + paragraph.html() + '</paragraph>';
    });

    xml += '</paragraphs>';

    var intScore = Math.round((correctAnswers / paragraphs.length) * 100);
    var score = String(intScore);
    $('.ActivityScore').attr('class', intScore >= 60 ? 'ActivityScore Pass' : 'ActivityScore Fail').html('Score: ' + score + '%');

    if (save && composer == '') {
    	var activityId = $('.ActivityContainer').attr('id').substring(8);
      var personId = Global.getQueryStringValue('pid');
      var courseVersionId = Global.getQueryStringValue('courseVersionId');
      var unit = Global.getQueryStringValue('unit');

      Courses.saveReorderParagraphsActivity(personId, courseVersionId, unit, activityId, xml, score, ReorderParagraphsActivity.saveComplete, ReorderParagraphsActivity.saveFailed);
    }
  },

  saveFailed: function (error) {
    alert('There was an error saving your activity. If this problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
  },

  saveComplete: function () {

  },

  clearAnswers: function () {
    $('.Grade').hide();
    $('.ActivityScore').removeClass('Pass').removeClass('Fail').html('');

    var paragraphs = $('.ParagraphsContainer').find('.ParagraphControl');

    paragraphs.each(function() {
      $(this).removeClass('Correct').removeClass('Incorrect');
    });
  }

};



var SlidingScale = {

  init: function (save) {
    $('.Slider').draggable({
      axis: 'x',
      containment: 'parent',
      drag: function () { SlidingScale.drag(this); },
      stop: function () { SlidingScale.dragStop(this, save); }
    });
  },

  drag: function (slider) {
    slider = $(slider);
    slider.parents('.SlidingScale').find('[class*="ProgressBar"]').css('width', slider.css('left'));
  },

  dragStop: function (slider, save) {
    if (save) {
      var slidingScaleId = $(slider).parents('.SlidingScale').attr('SlidingScaleID');
      var personId = Global.getQueryStringValue('pid');
      var x = $(slider).css('left').replace('px', '');
      Courses.saveSlidingScale(slidingScaleId, personId, x);
    }
  }

};

var Lab = {
	showTab: function (tabToShow) {
	// tab 0 and 99 are divs, while the others are iframes.  The iframes are located off-screen, but by setting the position back to static (from absolute), they'll snap back into place.
    x = 0;

    var labTabClicked = document.getElementById('labTab' + tabToShow);

    if (labTabClicked.classList.contains("Loading")) {
    	return;  //tab isn't ready yet
    }

    do {
      var currentTab = document.getElementById('labTab' + x);
      var currentTabContent = document.getElementById('labTab' + x + 'Content');
      var currentTabFrame = document.getElementById('labTab' + x + 'Frame');

      if (currentTabContent !== null || currentTabFrame !== null) {
      	if (x === tabToShow) {
      		currentTab.classList.add("labTabSelected");
        	if (currentTabContent !== null) {
        		currentTabContent.style.display = 'block';
        	} else {
        		currentTabFrame.style.position = 'static';
        		currentTabFrame.style.height = currentTabFrame.contentWindow.document.getElementById("CourseContent").scrollHeight + 'px';
        	}

        } else {
          currentTab.classList.remove("labTabSelected");
          if (currentTabContent !== null) {
          	currentTabContent.style.display = 'none';
          } else {
          	currentTabFrame.style.position = 'absolute';
          }
	  }
      }
      x++;
    } while (x < 50);

  },

  scrollLabTabsLeft: function () {
    var tabs = document.getElementById('labTabStrip').children;
    for (var i = tabs.length - 1; i >= 0; i--) {
      if (tabs[i].style.display === "none") {
        tabs[i].style.display = "";
        break;
      }
    }

  },

  scrollLabTabsRight: function () {

  	//var stencil = document.getElementsByClassName("labTabStripStencil")[0];
  	//$(".labTabStripStencil").animate({ "left": "+= 200px" });
    var tabs = document.getElementById('labTabStrip').children;
    for (var i = 0; i < tabs.length - 1; i++) {
      if (tabs[i].style.display !== "none") {
        tabs[i].style.display = "none";
        break;
      }
    }
  },

  requestLabTime: function (courseVersionId, unit, labId, studentId) {
  	Courses.requestLabTime(courseVersionId, unit, labId, studentId, Lab.requestLabTimeSuccess, Lab.requestLabTimeFailure);
  },

  requestLabTimeSuccess: function () {
  	//GlobalMaster.showGlobalNotifierMessage('Notify-Success', 'Your lab has been submitted.', 7000);
  	alert('Your request has been submitted.');
  },

  requestLabTimeFailure: function (error) {
  	alert('There was a problem sending the request.  If this problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
  },

  SubmitLabForGrading: function (courseVersionId, unit, labId, studentId) {
  	Courses.saveLab(courseVersionId, unit, labId, studentId, Lab.SubmitSuccessful, Lab.SubmitFailed);
  },
	
  SubmitSuccessful: function () {
  	//GlobalMaster.showGlobalNotifierMessage('Notify-Success', 'Your lab has been submitted.', 7000);
  	alert('Your lab has been submitted for grading.\n\nPlease check your Student Progress page to ensure that your lab has been graded by your teacher.  Remember that your lab work will count as 20% of your final Unit grade, and all labs in the Unit must be graded BEFORE you are approved to take the Final Exam. ');
  },

  SubmitFailed: function (error) {
  	alert('There was a problem submitting your lab.  If this problem persists, please contact Cyber High support. \n\n ERROR: ' + error.get_message());
  }
};

/* Popup Base Class */

var PopupWindowClass = function () {
  this.url = "about:blank";
  this.name = "popup";
  this.width = 760;
  this.height = 480;
  this.location = false;
  this.toolbar = false;
  this.menubar = false;
  this.resizable = true;
  this.scrollbars = true;
  this.statusbar = false;
  this.left = 0;
  this.top = 0;
};

PopupWindowClass.prototype.GetWindowOptions = function () {
  return "width=" + this.width +
           ",height=" + this.height +
					 ",location=" + (this.location ? 1 : 0) +
           ",resizable=" + (this.resizable ? 1 : 0) +
					 ",toolbar=" + (this.toolbar ? 1 : 0) +
					 ",menubar=" + (this.menubar ? 1 : 0) +
           ",scrollbars=" + (this.scrollbars ? 1 : 0) +
           ",statusbar=" + (this.statusbar ? 1 : 0) +
           ",left=" + this.left +
           ",top=" + this.top;
};

PopupWindowClass.prototype.Open = function () {
  this.Show();
};

PopupWindowClass.prototype.GetWindowObject = function () {
  var win = window.open(this.url, this.name, this.GetWindowOptions());
  return win;
};

PopupWindowClass.prototype.Show = function () {
  var win = window.open(this.url, this.name, this.GetWindowOptions());

  win.focus();
};

/* End Popup Base Class */

