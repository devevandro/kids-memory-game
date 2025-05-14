"use client"

import { useState, useEffect } from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import dynamic from "next/dynamic"

// Dynamically import Confetti to avoid SSR issues
const Confetti = dynamic(() => import("react-confetti").then((mod) => mod.default), {
  ssr: false,
})

export default function MemoryGame() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <GameContent />
    </ThemeProvider>
  )
}

function GameContent() {
  const [cards, setCards] = useState([])
  const [flippedCards, setFlippedCards] = useState([])
  const [matchedPairs, setMatchedPairs] = useState([])
  const [currentPlayer, setCurrentPlayer] = useState(1)
  const [scores, setScores] = useState({ player1: 0, player2: 0 })
  const [gameOver, setGameOver] = useState(false)
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [showConfetti, setShowConfetti] = useState(false)

  // Player setup state
  const [showSetupModal, setShowSetupModal] = useState(true)
  const [playerCount, setPlayerCount] = useState("2")
  const [player1Name, setPlayer1Name] = useState("Player 1")
  const [player2Name, setPlayer2Name] = useState("Player 2")
  const [gameStarted, setGameStarted] = useState(false)
  const [selectedTheme, setSelectedTheme] = useState("animals")

  // Theme options
  const themeOptions = {
    animals: [
      { name: "lion", emoji: "🦁" },
      { name: "dog", emoji: "🐶" },
      { name: "horse", emoji: "🐴" },
      { name: "chicken", emoji: "🐔" },
      { name: "pig", emoji: "🐷" },
      { name: "monkey", emoji: "🐵" },
    ],
    food: [
      { name: "pizza", emoji: "🍕" },
      { name: "burger", emoji: "🍔" },
      { name: "icecream", emoji: "🍦" },
      { name: "apple", emoji: "🍎" },
      { name: "grapes", emoji: "🍇" },
      { name: "chocolate", emoji: "🍫" },
    ],
    cars: [
      { name: "car", emoji: "🚗" },
      { name: "taxi", emoji: "🚕" },
      { name: "suv", emoji: "🚙" },
      { name: "bus", emoji: "🚌" },
      { name: "police", emoji: "🚓" },
      { name: "ambulance", emoji: "🚑" },
    ],
    flowers: [
      { name: "rose", emoji: "🌹" },
      { name: "tulip", emoji: "🌷" },
      { name: "sunflower", emoji: "🌻" },
      { name: "hibiscus", emoji: "🌺" },
      { name: "blossom", emoji: "🌸" },
      { name: "daisy", emoji: "🌼" },
    ],
    people: [
      { name: "man", emoji: "👨" },
      { name: "woman", emoji: "👩" },
      { name: "baby", emoji: "👶" },
      { name: "police", emoji: "👮" },
      { name: "doctor", emoji: "👩‍⚕️" },
      { name: "firefighter", emoji: "👨‍🚒" },
    ],
  }

  const partyEmojis = ["🎉", "🎊"]

  useEffect(() => {
    // Set window size for confetti
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    }

    updateWindowSize()
    window.addEventListener("resize", updateWindowSize)

    return () => window.removeEventListener("resize", updateWindowSize)
  }, [])

  useEffect(() => {
    if (gameStarted) {
      initializeGame()
    }
  }, [gameStarted, selectedTheme])

  const initializeGame = () => {
    // Get the current theme icons
    const themeIcons = themeOptions[selectedTheme]

    // Create pairs of cards with the selected theme icons
    const cardPairs = [...themeIcons, ...themeIcons].map((item, index) => ({
      id: index,
      name: item.name,
      emoji: item.emoji,
      isFlipped: false,
      isMatched: false,
    }))

    // Shuffle the cards
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5)

    setCards(shuffledCards)
    setFlippedCards([])
    setMatchedPairs([])
    setCurrentPlayer(1)
    setScores({ player1: 0, player2: 0 })
    setGameOver(false)
    setShowConfetti(false)
  }

  const handleCardClick = (cardId) => {
    // Prevent clicking if already two cards are flipped or the card is already flipped/matched
    if (flippedCards.length === 2 || flippedCards.includes(cardId) || matchedPairs.includes(cardId) || gameOver) {
      return
    }

    // Flip the card
    const newFlippedCards = [...flippedCards, cardId]
    setFlippedCards(newFlippedCards)

    // If two cards are flipped, check for a match
    if (newFlippedCards.length === 2) {
      const [firstCardId, secondCardId] = newFlippedCards
      const firstCard = cards.find((card) => card.id === firstCardId)
      const secondCard = cards.find((card) => card.id === secondCardId)

      if (firstCard.name === secondCard.name) {
        // Match found
        const newMatchedPairs = [...matchedPairs, firstCardId, secondCardId]
        setMatchedPairs(newMatchedPairs)

        // Update score for current player
        const newScores = { ...scores }
        if (currentPlayer === 1) {
          newScores.player1 += 1
        } else {
          newScores.player2 += 1
        }
        setScores(newScores)

        // Clear flipped cards
        setFlippedCards([])

        // Check if game is over
        if (newMatchedPairs.length === cards.length) {
          setGameOver(true)
          setShowConfetti(true)
          // Hide confetti after 8 seconds
          setTimeout(() => {
            setShowConfetti(false)
          }, 8000)
        }
      } else {
        // No match, switch player after a delay
        setTimeout(() => {
          setFlippedCards([])
          if (playerCount === "2") {
            setCurrentPlayer(currentPlayer === 1 ? 2 : 1)
          }
        }, 1000)
      }
    }
  }

  const handleStartGame = () => {
    setShowSetupModal(false)
    setGameStarted(true)
  }

  const resetGame = () => {
    initializeGame()
  }

  const showPlayerSetup = () => {
    setShowSetupModal(true)
    setGameStarted(false)
  }

  // Get theme name for display
  const getThemeDisplayName = (themeKey) => {
    const names = {
      animals: "Animals",
      food: "Food",
      cars: "Cars",
      flowers: "Flowers",
      people: "People",
    }
    return names[themeKey] || themeKey
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 relative overflow-hidden bg-gray-900 text-white">
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={true}
          numberOfPieces={200}
          gravity={0.2}
        />
      )}

      {/* Player Setup Modal */}
      <Dialog open={showSetupModal} onOpenChange={setShowSetupModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold" style={{ color: "#483d8b" }}>
              Kids Memory Game Setup
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="theme-select">Choose Theme</Label>
              <Tabs defaultValue={selectedTheme} onValueChange={setSelectedTheme} className="w-full">
                <TabsList className="grid grid-cols-5 mb-2">
                  {Object.keys(themeOptions).map((theme) => (
                    <TabsTrigger key={theme} value={theme}>
                      {getThemeDisplayName(theme)}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {Object.entries(themeOptions).map(([theme, icons]) => (
                  <TabsContent key={theme} value={theme} className="mt-0">
                    <div className="grid grid-cols-3 gap-2 p-2 bg-gray-800 rounded-md">
                      {icons.map((item, index) => (
                        <div
                          key={index}
                          className="aspect-square flex items-center justify-center text-3xl bg-gray-700 rounded-md"
                        >
                          {item.emoji}
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            <div className="space-y-2">
              <Label htmlFor="player-count">Number of Players</Label>
              <RadioGroup
                id="player-count"
                value={playerCount}
                onValueChange={setPlayerCount}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="one-player" />
                  <Label htmlFor="one-player">1 Player</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="two-players" />
                  <Label htmlFor="two-players">2 Players</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="player1-name">Player 1 Name</Label>
              <Input
                id="player1-name"
                value={player1Name}
                onChange={(e) => setPlayer1Name(e.target.value)}
                placeholder="Enter Player 1 name"
              />
            </div>

            {playerCount === "2" && (
              <div className="space-y-2">
                <Label htmlFor="player2-name">Player 2 Name</Label>
                <Input
                  id="player2-name"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  placeholder="Enter Player 2 name"
                />
              </div>
            )}

            <Button onClick={handleStartGame} className="w-full" style={{ backgroundColor: "#483d8b" }}>
              Start Game
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-center w-full" style={{ color: "#483d8b" }}>
            Kids Memory Game: {getThemeDisplayName(selectedTheme)}
          </h1>
        </div>

        <div className="flex justify-between items-center mb-6">
          <Button onClick={resetGame} style={{ backgroundColor: "#483d8b" }} className="hover:bg-opacity-90">
            Reset Game
          </Button>

          <Button onClick={showPlayerSetup} style={{ backgroundColor: "#483d8b" }} className="hover:bg-opacity-90">
            Change Settings
          </Button>
        </div>

        {playerCount === "2" && (
          <div className="flex justify-between mb-4">
            <div
              className={cn(
                "p-2 rounded-md font-semibold",
                currentPlayer === 1 ? "bg-opacity-100" : "bg-opacity-50",
                "transition-all",
              )}
              style={{ backgroundColor: currentPlayer === 1 ? "#483d8b" : "transparent", border: "2px solid #483d8b" }}
            >
              {player1Name}: {scores.player1}
            </div>
            <div
              className={cn(
                "p-2 rounded-md font-semibold",
                currentPlayer === 2 ? "bg-opacity-100" : "bg-opacity-50",
                "transition-all",
              )}
              style={{ backgroundColor: currentPlayer === 2 ? "#483d8b" : "transparent", border: "2px solid #483d8b" }}
            >
              {player2Name}: {scores.player2}
            </div>
          </div>
        )}

        {playerCount === "1" && (
          <div className="mb-4 p-2 rounded-md font-semibold text-center" style={{ backgroundColor: "#483d8b" }}>
            {player1Name}: {scores.player1}
          </div>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4">
          {cards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={cn(
                "aspect-square rounded-lg flex items-center justify-center cursor-pointer transition-all duration-300",
              )}
              style={{
                backgroundColor:
                  flippedCards.includes(card.id) || matchedPairs.includes(card.id) ? "#483d8b" : "#6156a4",
                border: flippedCards.includes(card.id)
                  ? "3px solid #3e3769"
                  : matchedPairs.includes(card.id)
                    ? "3px solid #483d8b"
                    : "3px solid transparent",
              }}
            >
              {(flippedCards.includes(card.id) || matchedPairs.includes(card.id)) && (
                <div className="text-4xl">{card.emoji}</div>
              )}
            </div>
          ))}
        </div>

        {/* Game Over Modal */}
        {gameOver && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setGameOver(false)}></div>
            <div className="relative p-6 rounded-lg text-center max-w-sm w-full" style={{ backgroundColor: "#483d8b" }}>
              <h2 className="text-2xl font-bold mb-4">
                Game Over! {partyEmojis[0]} {partyEmojis[1]}
              </h2>

              {playerCount === "2" ? (
                <p className="text-xl mb-4">
                  {scores.player1 > scores.player2
                    ? `${player1Name} Wins!`
                    : scores.player2 > scores.player1
                      ? `${player2Name} Wins!`
                      : "It's a Tie!"}
                </p>
              ) : (
                <p className="text-xl mb-4">
                  {player1Name} Score: {scores.player1}
                </p>
              )}

              {playerCount === "2" && (
                <p className="mb-4">
                  {player1Name}: {scores.player1} | {player2Name}: {scores.player2}
                </p>
              )}

              <div className="flex justify-center space-x-3 mt-4">
                <Button onClick={resetGame} className="bg-white text-purple-900 hover:bg-gray-200">
                  Play Again
                </Button>
                <Button onClick={showPlayerSetup} className="bg-white text-purple-900 hover:bg-gray-200">
                  Change Settings
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
