document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const cardElement = document.getElementById('card'); // Target Card
  const rankTopLeft = document.getElementById('rank-top-left');
  const suitTopLeft = document.getElementById('suit-top-left');
  const rankCenter = document.getElementById('rank-center');
  const rankBottomRight = document.getElementById('rank-bottom-right');
  const suitBottomRight = document.getElementById('suit-bottom-right');
  const generateButton = document.getElementById('generate-button'); // Deals Target Card
  const widthInput = document.getElementById('width-input');
  const heightInput = document.getElementById('height-input');
  const crtToggleButton = document.getElementById('crt-toggle');
  const crtOverlay = document.getElementById('crt-overlay');
  const deckButton = document.getElementById('deck-button');       // Deals Hand
  const deckContainer = document.getElementById('deck');             // Hand container
  const gameFeedback = document.getElementById('game-feedback');   // Feedback display

  // --- Card Data ---
  const suits = ['♦', '♥', '♠', '♣'];
  const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

  // --- Game State ---
  let currentTargetCard = { rank: null, suit: null }; // Store the target card details
  let handDealt = false; // Track if the hand is currently shown

  // --- Functions ---

  function getRandomCard() {
      const randomSuitIndex = Math.floor(Math.random() * suits.length);
      const randomRankIndex = Math.floor(Math.random() * ranks.length);
      return {
          suit: suits[randomSuitIndex],
          rank: ranks[randomRankIndex]
      };
  }

  // Displays the main Target Card
  function displayTargetCard(card) {
      if (!rankTopLeft || !suitTopLeft || !rankCenter || !rankBottomRight || !suitBottomRight || !cardElement) {
          console.error("One or more target card elements not found!");
          return;
      }
      rankTopLeft.textContent = card.rank;
      suitTopLeft.textContent = card.suit;
      rankCenter.textContent = card.rank;
      rankBottomRight.textContent = card.rank;
      suitBottomRight.textContent = card.suit;

      const isRed = card.suit === '♥' || card.suit === '♦';
      cardElement.classList.toggle('red', isRed);
      cardElement.classList.toggle('black', !isRed);

      // Store the current target card details for the game
      currentTargetCard.rank = card.rank;
      currentTargetCard.suit = card.suit;

      console.log("Target card:", currentTargetCard.rank, currentTargetCard.suit);
  }

  // Generates and displays the Target Card, resets game elements
  function dealNewTargetCard() {
      console.log("Dealing new target card...");
      const randomCard = getRandomCard();
      displayTargetCard(randomCard);

      // Reset game state when a new target card is dealt
      hideHand(); // Hide the hand
      resetFeedback(); // Clear feedback message

      // Optional: subtle animation for the target card
      if (cardElement) {
          cardElement.style.transform = 'scale(1.01)';
          setTimeout(() => { cardElement.style.transform = ''; }, 100);
      }
  }

  function updateCardSize() {
      const width = widthInput.value;
      const height = heightInput.value;
      if (width > 0 && height > 0) {
          document.documentElement.style.setProperty('--card-width', `${width}px`);
          document.documentElement.style.setProperty('--card-height', `${height}px`);
      }
  }

  function toggleCrtEffect() {
      crtOverlay.classList.toggle('active');
      document.body.classList.toggle('pixelated');
      crtToggleButton.classList.toggle('active');
  }

  // --- Mini-Game: Hand Deck Functionality ---

  // Creates the HTML structure for one card in the hand
  function createHandCardHTML() {
      // Use template literals for cleaner HTML generation
      return `
          <div class="card">
              <div class="card-inner">
                  <div class="face-down"></div>
                  <div class="face-up">
                      <div class="corner top-left">
                          <span class="rank"></span>
                          <span class="suit"></span>
                      </div>
                      <div class="center-rank">
                          <span class="rank"></span>
                      </div>
                      <div class="corner bottom-right">
                          <span class="rank"></span>
                          <span class="suit"></span>
                      </div>
                  </div>
              </div>
          </div>
      `;
  }

  // Generates the structure for the 5 cards in the hand
  function generateHandStructure() {
      deckContainer.innerHTML = ''; // Clear previous hand
      for (let i = 0; i < 5; i++) {
          deckContainer.innerHTML += createHandCardHTML();
      }
  }

  // Assigns random card data to each card element in the hand
  function assignCardsToHand() {
      const handCardElements = deckContainer.querySelectorAll('.card');
      handCardElements.forEach(cardEl => {
          const randomCard = getRandomCard();
          const isRed = randomCard.suit === '♥' || randomCard.suit === '♦';

          // Reset classes
          cardEl.classList.remove('red', 'black', 'flipped', 'matched', 'no-match');
          cardEl.classList.add(isRed ? 'red' : 'black');

          // Store card data directly on the element for easy access later
          cardEl.dataset.rank = randomCard.rank;
          cardEl.dataset.suit = randomCard.suit;

          // Get elements within this specific card
          const tlRank = cardEl.querySelector('.top-left .rank');
          const tlSuit = cardEl.querySelector('.top-left .suit');
          const centerRankEl = cardEl.querySelector('.center-rank .rank'); // Adjusted selector
          const brRank = cardEl.querySelector('.bottom-right .rank');
          const brSuit = cardEl.querySelector('.bottom-right .suit');

          // Populate card face
          if (tlRank) tlRank.textContent = randomCard.rank;
          if (tlSuit) tlSuit.textContent = randomCard.suit;
          if (centerRankEl) centerRankEl.textContent = randomCard.rank; // Display rank in center too
          if (brRank) brRank.textContent = randomCard.rank;
          if (brSuit) brSuit.textContent = randomCard.suit;
      });
  }

  // Deals the hand: generates structure, assigns cards, makes visible
  function dealHand() {
      if (!currentTargetCard.rank) {
          setFeedback("Deal a Target Card first!", "");
          return; // Don't deal hand if no target card exists
      }
      console.log("Dealing hand...");
      generateHandStructure();
      assignCardsToHand();
      deckContainer.classList.add('visible');
      handDealt = true;
      resetFeedback(); // Clear previous feedback when dealing new hand
      setFeedback("Click a card below to check for a match!", "");
  }

  // Hides the hand
  function hideHand() {
      deckContainer.classList.remove('visible');
      handDealt = false;
  }

  // Handles clicking on a card in the hand
  function handleHandCardClick(event) {
      const clickedCardElement = event.target.closest('.deck .card');

      // Ensure a card was clicked and it's not already flipped
      if (!clickedCardElement || clickedCardElement.classList.contains('flipped')) {
          return;
      }

      // Flip the card
      clickedCardElement.classList.add('flipped');

      // Get the flipped card's details from its data attributes
      const flippedRank = clickedCardElement.dataset.rank;
      const flippedSuit = clickedCardElement.dataset.suit;

      console.log(`Flipped: ${flippedRank}${flippedSuit}. Target: ${currentTargetCard.rank}${currentTargetCard.suit}`);

      // Check for match (Rank OR Suit)
      if (flippedRank === currentTargetCard.rank || flippedSuit === currentTargetCard.suit) {
          console.log("Match found!");
          clickedCardElement.classList.add('matched');
          setFeedback(`MATCH! (${flippedRank}${flippedSuit}) matches Rank or Suit.`, 'match');
      } else {
          console.log("No match.");
          clickedCardElement.classList.add('no-match');
          setFeedback(`No Match (${flippedRank}${flippedSuit}). Try another card!`, 'no-match');
      }
  }

  // Updates the feedback message area
  function setFeedback(message, type = '') { // type can be 'match', 'no-match', or ''
      if (gameFeedback) {
          gameFeedback.textContent = message;
          gameFeedback.className = 'game-feedback'; // Reset classes
          if (type) {
              gameFeedback.classList.add(type);
          }
      }
  }

   // Resets the feedback message area to default
   function resetFeedback() {
      setFeedback("Click 'Deal Hand' to start or click a card.", "");
  }

  // --- Initialization and Event Handlers ---

  updateCardSize();      // Set initial card size
  dealNewTargetCard();   // Deal the first Target Card on load

  // Button Listeners
  if (generateButton) {
      generateButton.addEventListener('click', dealNewTargetCard);
  } else { console.error("Target Card Button not found!"); }

  if (deckButton) {
      deckButton.addEventListener('click', dealHand);
  } else { console.error("Deal Hand Button not found!"); }

  // Size Input Listeners
  if (widthInput) widthInput.addEventListener('input', updateCardSize);
  if (heightInput) heightInput.addEventListener('input', updateCardSize);

  // CRT Toggle Listener
  if (crtToggleButton) {
      crtToggleButton.addEventListener('click', toggleCrtEffect);
  } else { console.error("CRT toggle button not found!"); }

  // Hand Card Click Listener (Event Delegation)
  if (deckContainer) {
      deckContainer.addEventListener('click', handleHandCardClick);
  } else { console.error("Deck container not found!"); }

  // Remove the automatic 10-second refresh unless desired for the Target Card
  // setInterval(dealNewTargetCard, 10000); // Uncomment if you want target card to auto-refresh

}); // End of DOMContentLoaded