$(document).ready(function functionName() {
// $('body').removeClass('bg1').addClass('bg2');

var x = $('body').addClass('bg1');


  var playersHand = [];
  var playerBank = 100;
  var playerBet = 0;
  var dealersHand = [];
  const freshDeck = createDeck();  // not technically a constructor...no 'new'
  console.log(freshDeck);

  var theDeck = freshDeck.slice();  // have to slice...otherwise reference

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

    $('.player-bank').html(`Player Bank: ${playerBank}`);
    $('.player-bet').html(`Player Bet: ${playerBet}`);

  });

  $('.deal-button').click(function() {


    var theDeck = freshDeck.slice();
    theDeck = shuffleDeck(theDeck);
    console.log(theDeck);


    // $('.deal-button').addClass('disabled');
    $('.deal-button').prop('disabled', true);  // player has to hit or stand but can't bet anymore
    $('.bet-button').prop('disabled', true);

    // let them play the hand...
    $('.hit-button').prop('disabled', false);
    $('.stand-button').prop('disabled', false);

    newHands();  // clear table, reset hands, update totals

    // deal out the first 4 cards....
    playersHand.push(theDeck.shift());
    dealersHand.push(theDeck.shift());
    playersHand.push(theDeck.shift());
    dealersHand.push(theDeck.shift());

    //place cards on the table....
    placeCard('player',1, playersHand[0]);
    placeCard('dealer',1, dealersHand[0]);
    placeCard('player',2, playersHand[1]);
    placeCard('dealer',2, dealersHand[1]);

    calculateTotals(playersHand, 'player');
    calculateTotals(dealersHand, 'dealer');


  });

  $('.hit-button').click(function() {
    var playerTotal = 0;

    console.log("player hit-button");
    playersHand.push(theDeck.shift());
    placeCard('player',playersHand.length, playersHand[playersHand.length - 1]);
    playerTotal = calculateTotals(playersHand, 'player');

    if (playerTotal > 21){     // player busted...can't hit or stand
      $('.hit-button').prop('disabled', true);
      $('.stand-button').prop('disabled', true);
      checkWin();
    }

  });

  $('.stand-button').click(function() {

    $('.hit-button').prop('disabled', true);  // player can't hit after standing
    $('.stand-button').prop('disabled', true);  // player can't stand again

    var dealersTotal = calculateTotals(dealersHand, 'dealer');

    while (dealersTotal < 17) {
      dealersHand.push(theDeck.shift());
      placeCard('dealer',dealersHand.length, dealersHand[dealersHand.length - 1]);
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
      console.log(`player busted ${playerTotal}`);
      playerBet = 0;
    } else if (dealersTotal > 21) {
      // dealer busted...
      playerBank += playerBet * 2;
      playerBet = 0;
      console.log(`dealer busted ${dealersTotal}`);
    } else if (playerTotal > dealersTotal) {
      // you beat the dealer
      playerBank += playerBet * 2;
      playerBet = 0;
      console.log('player beat the dealer');
    } else if (dealersTotal >= playerTotal) {
      // you lose to the dealer
      playerBet = 0;
      console.log('player loses to the dealer');
    } else if (playerTotal == 21 && playersHand.length == 2) {
      // player has BLACKJACK
      playerBlackJack = true;
    }

    if (dealersTotal == 21 && dealersHand.length == 2) {
      // dealer has BLACKJACK
      dealerBlackJack = true;
    }

    if (playerBlackJack && dealerBlackJack){
      // it's a push...leave bet on the table
      console.log("It's a PUSH");
    } else if (playerBlackJack) {
      // Player Wins DOUBLE
      playerBank += playerBet * 4;
      console.log("Player has BLACKJACK!");
    }

    // update the visuals....
    $('.player-bank').html(`Player Bank: ${playerBank}`);
    $('.player-bet').html(`Player Bet: ${playerBet}`);

    // Give player opportunity to play again....if they have money!
    if (playerBank > 0){
      $('.bet-button').prop('disabled', false);
    }
    else{
      console.log("Player is out of money...send them home");
    }

  }

  function newHands() {

    // clear out hands...
    playersHand = [];
    dealersHand = [];

    // calculate totals...use function b/c it updates on screen
    calculateTotals(playersHand, 'player');
    calculateTotals(dealersHand, 'dealer');

    // clear out any cards on the table...
    for (let i = 1; i < 7; i++) {
      $(`.card-${i}`).html('-');
    }

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

    var classSelector = `.${who}-total`;
    $(classSelector).html(handTotal);

    return(handTotal);
  }


  function placeCard(who, where, whichCard){
    var classSelector = `.${who}-cards .card-${where}`;

    $(classSelector).html(`<img src="images/cards/${whichCard}.png">`);
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
