$(document).ready(function () {
// $('body').removeClass('bg1').addClass('bg2');

var x = $('body').addClass('bg1');


  var playersHand = [];
  var playerBank = 100;
  var playerBet = 0;
  var dealersHand = [];
  const freshDeck = createDeck();  // not technically a constructor...no 'new'
  console.log(freshDeck);

  var theDeck = freshDeck.slice();  // have to slice...otherwise reference

  // hide the game-modal on any key press
  $(document).keyup(function(event) {
       $('#game-modal').modal('hide');
    });


  $('.bet-button').click(function() {

    $('.deal-button').prop('disabled', false);  // allow the deal after bet

    console.log("player bet-button");
    if (playerBank > 0){
      playerBet += 5;
      playerBank -= 5;
    }
    else {   // can't bet what you don't have...
      $('.bet-button').prop('disabled', true);  // no more betting
    }

    $('.player-bank').html(`${playerBank}`);
    $('.player-bet').html(`${playerBet}`);

  });

  $('.dd-button').click(function() {
    // player is choosing to take double their bet and take just 1 card...
    // so....double the bet, trigger the "hit" action and trigger stand if it not disabled (possible that it was disabled on hit if a bust occurs)

    //Assumption:  this button only appears when it is possible for the player to double-down

    if (playerBank < playerBet){  // should NEVER happen based on assumption
      window.alert("Call the gaming commission....illegal bet.  NSF to double down!!");
    }
    else {
      playerBank -= playerBet;
      playerBet += playerBet;
    }

    $('.player-bank').html(`${playerBank}`);
    $('.player-bet').html(`${playerBet}`);
    $('.dd-button').css('display','none');

    $('.hit-button').trigger('click');  // hit me!

    //Use the hit button status to determine if we need to trigger stand...if disabled then player busted

    if (!($('.hit-button').disabled)) {        // player didn't bust
      $('.stand-button').trigger('click');   // hit me!
    }

  });


  $('.deal-button').click(function() {


    var theDeck = freshDeck.slice();
    theDeck = shuffleDeck(theDeck);
    console.log(theDeck);
    var playerTotal = 0;
    var dealersTotal = 0;

    // player has to play the hand dealt...can't deal again nor bet anymore
    $('.deal-button').prop('disabled', true);
    $('.bet-button').prop('disabled', true);

    // normal play is hit or stand....may be overridden below based on hand
    $('.hit-button').prop('disabled', false);
    $('.stand-button').prop('disabled', false);

    newHands();  // clear table, reset hands, update totals

    // deal out the first 4 cards....
    playersHand.push(theDeck.shift());
    dealersHand.push(theDeck.shift());
    playersHand.push(theDeck.shift());
    dealersHand.push(theDeck.shift());

    // // Test Blackjack
    // playersHand.push('1h');
    // playersHand.push('13h');

    //place each card after building a flippable card...add a delay to simulate real deal

    // // Still need to wrap a delay between the cards here, otherwise the other delays are concurrent and seem to appear all at once....
    //
    placeCard('player',1, buildCard(playersHand[0],true,0));

    setTimeout(function() {
      placeCard('dealer',1, buildCard(dealersHand[0],true));
    }, 500);

    setTimeout(function() {
      placeCard('player',2, buildCard(playersHand[1],true));
    }, 100);

    setTimeout(function() {
      placeCard('dealer',2, buildCard(dealersHand[1],false));
    }, 1500);

    playerTotal = calculateTotals(playersHand, 'player');
    dealersTotal = calculateTotals(dealersHand, 'dealer');

    // now override normal play based on playersHand...
    if (playerTotal == 21){
      $('.dd-button').css('display','none'); // can't double-down
      $('.stand-button').trigger('click');  // be nice and stand for the player
    } else if (playerBank >= playerBet){   // allow the player to double-down
      $('.dd-button').css('display','inline-block');
    }
    else {
      $('.dd-button').css('display','none');
    }

  });

  $('.hit-button').click(function() {
    var playerTotal = 0;
    $('.dd-button').css('display','none');
    var cardHTML = "";

    playersHand.push(theDeck.shift());

    cardHTML = buildCard(playersHand[playersHand.length -1],true);

    placeCard('player',playersHand.length, cardHTML);

    playerTotal = calculateTotals(playersHand, 'player');

    // check to see if player busted or hit the card limit for this game...act accordingly
    if (playerTotal > 21){
      $('.hit-button').prop('disabled', true);
      $('.stand-button').prop('disabled', true);
      checkWin();
    } else if (playersHand.length == 6) {
      $('.hit-button').prop('disabled', true);
      $('.stand-button').trigger('click');
    }

  });

  $('.stand-button').click(function() {
    var cardHTML = "";

    $('.hit-button').prop('disabled', true);  // player can't hit after standing
    $('.stand-button').prop('disabled', true);  // player can't stand again
    $('.dd-button').css('display','none'); // can't double-down either

    var dealersTotal = calculateTotals(dealersHand, 'dealer');

    var delayOffset = 0;
    while (dealersTotal < 17) {
      delayOffset += 500;  // helps give illusion of pause between cards...
      dealersHand.push(theDeck.shift());

      cardHTML = buildCard(dealersHand[dealersHand.length - 1],true);

      placeCard('dealer',dealersHand.length, cardHTML);

      dealersTotal = calculateTotals(dealersHand, 'dealer');
    }

    checkWin();
  });


  function checkWin() {
    var playerTotal = calculateTotals(playersHand, 'player');
    var dealersTotal = calculateTotals(dealersHand, 'dealer');
    playerBlackJack = false;
    dealerBlackJack = false;

    if (playerTotal > 21) {
      //busted
      $('#game-message').html(`PLAYER BUSTED! Lose ${playerBet}`);
    } else if (dealersTotal > 21) {
      // dealer busted...
      playerBank += playerBet * 2;
      $('#game-message').html(`DEALER BUSTED! Win ${playerBet}`);
    } else if (playerTotal == 21 && playersHand.length == 2) {
      // player has BLACKJACK
      playerBlackJack = true;
    } else if (playerTotal > dealersTotal) {
      // you beat the dealer
      playerBank += playerBet * 2;
      $('#game-message').html(`PLAYER WINS Win ${playerBet}`);
    } else if (dealersTotal >= playerTotal) {
      // you lose to the dealer
      $('#game-message').html(`HOUSE WINS.  Lose ${playerBet}`);
    }

    if (dealersTotal == 21 && dealersHand.length == 2) {
      // dealer has BLACKJACK
      dealerBlackJack = true;
    }

    if (playerBlackJack && dealerBlackJack){
      // it's a push...
      playerBank += playerBet;
      $('#game-message').html("NO WINNER - PUSH");
    } else if (playerBlackJack) {
      // Player Wins 150%
      playerBank += playerBet * 2.5;
      $('#game-message').html(`PLAYER WINS -- BLACKJACK PAYS ${playerBet*1.5}`);
    }

    // reveal dealers 2nd card....
    $('.dealer-cards .card-2 .flipper').addClass('flip');

    // update the totals....
    playerBet = 0;  // Always goes to 0...
    $('.dealer-total').html(dealersTotal);
    $('.player-bank').html(`${playerBank}`);
    $('.player-bet').html(`${playerBet}`);

    // Give player opportunity to play again....if they have money!
    if (playerBank > 0){
      $('.bet-button').prop('disabled', false);
    }
    else{
      $('#game-message').html("PLAYER LOST THEIR BANKROLL");
    }

    $('#game-modal').modal('show');
  }


  function newHands() {

    // clear out hands...
    playersHand = [];
    dealersHand = [];

    // clear out any cards on the table...
    for (let i = 1; i < 7; i++) {
      $(`.card-${i}`).html('-');
    }

    // clear out game message and totals...
    $('#game-message').html("");
    $('.player-total').html("");
    $('.dealer-total').html("");

  }
  function calculateTotals(hand, who) {
    //Our cards go from 1(Ace) to 13(King)...
    // Adjust for  K, Q, J.  Ace adjustment depends on current total

    var handTotal = 0;
    var currentCardValue = 0;
    var aceCount = 0;

    for(let i = 0; i < hand.length; i++){
      currentCardValue = Number(hand[i].slice(0,-1)); //drops the last char
      if (currentCardValue >= 11) {
        currentCardValue = 10;
      }
      else if (currentCardValue == 1) {
        aceCount+=1;
        currentCardValue = 11;
        }
      handTotal += currentCardValue;
      }

      //adjust for all aces in hand..will result in highest handTotal less than 21

      while (handTotal > 21 && aceCount > 0){
        handTotal -= 10;
        aceCount -= 1;
      }

    if (who == 'player'){     // only player...dealer is later.
      var classSelector = `.${who}-total`;
      $(classSelector).html(handTotal);
    }

    return(handTotal);
  }

  function buildCard(whichCard, faceUp=true) {
    // this function constructs a flippable card and returns the complete HTML that can be placed into the DOM
    var cardHTML = "";

    if (faceUp == true){
      // make the top the value, bottom the cardback
      cardHTML += `<div class="flipper">`;
      cardHTML += `<div class='card-top'>`;
      cardHTML += `<img src="images/cards/${whichCard}.png">`;
      cardHTML += `</div>`;
      cardHTML += `<div class='card-bottom'>`;
      cardHTML += `<img src="images/cards/steampunkcardback.jpg">`;
      cardHTML += `</div>`;
      cardHTML += `</div>`;
    } else {
      // make the top the cardback, bottom the value
      cardHTML += `<div class="flipper">`;
      cardHTML += `<div class='card-top'>`;
      cardHTML += `<img src="images/cards/steampunkcardback.jpg">`;
      cardHTML += `</div>`;
      cardHTML += `<div class='card-bottom'>`;
      cardHTML += `<img src="images/cards/${whichCard}.png">`;
      cardHTML += `</div>`;
      cardHTML += `</div>`;
    }

    return(cardHTML);

  }
  function placeCard(who, where, cardHTML, delay=500){

    setTimeout(function() {
      var classSelector = `.${who}-cards .card-${where}`;
      $(classSelector).html(cardHTML);
    }, delay);
  }


  function createDeck(){
    var newDeck = [];

    const suits = ['h','s', 'd', 'c'];  // useful for targeint image files

    for (let s = 0; s < suits.length; s++){
      for (let c = 1; c <= 13; c++){
        newDeck.push(c+suits[s]);  // rely on int to text conversion to build
      }
    }
    return (newDeck);
  }

  function shuffleDeck(aDeckToBeShuffled) {
    // loop a lot.  switch indices.  at end the deck is shuffled.

    for (let i = 0; i < 50000; i++){
      var rand1 = Math.floor(Math.random() * aDeckToBeShuffled.length);
      var rand2 = Math.floor(Math.random() * aDeckToBeShuffled.length);

      // swap cards....need tempCard to avoid overwriting or losing
      var tempCard = aDeckToBeShuffled[rand1];
      aDeckToBeShuffled[rand1] = aDeckToBeShuffled[rand2];
      aDeckToBeShuffled[rand2] = tempCard;
    }
    return(aDeckToBeShuffled);
  }
});
