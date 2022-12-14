// GAME STATE
const GAME_STATE = {
  FirstCardAwaits: 'FirstCardAwaits',
  SecondCardAwaits: 'SecondCardAaaits',
  CardsMatchedFailed: 'CardsMatchedFailed',
  CardsMatched: 'CardsMatched',
  GameFinished: 'GameFinished',
}

// 宣告這個花色陣列：
/**註：此處 Symbols 常數儲存的資料不會變動，因此習慣上將首字母大寫以表示此特性 */

const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png', // 梅花
]

// MVC架構，宣告物件 把函式放進去
// 介面
const view = {
  // 當物件的屬性與函式/變數名稱相同時，可以省略不寫
  // getCardElement : functin getCardElement() {...} 可寫成如下

  getCardElement(index) {
    return ` <div data-index="${index}" class="card back"></div>`
  },

  //
  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src="${symbol}" alt="">
      <p>${number}</p>
    `
  },

  flipCards(...cards) {
    cards.map((card) => {
      if (card.classList.contains('back')) {
        // 回傳正面
        card.classList.remove('back')
        // *** 記得要重新渲染畫面&& return 結束***
        // console.log(this)
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }

      //回傳背面
      card.classList.add('back')
      card.innerHTML = null
    })
  },

  pairCards(...cards) {
    cards.map((card) => {
      card.classList.add('paired')
    })
  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    // this 指的是呼叫displayCards的變數 也就是view
    // 產生 52 張牌
    // 步驟1: Array(52)產生[emtpy x 52] 陣列, .keys()取index值，用Array.form 組成新陣列[0..51]
    // 步驟2:取新陣列[0...51]丟到map 利用index取出52張卡牌陣列，再用join()組合成字串
    // 步驟3:將字串帶入innerHTML
    rootElement.innerHTML = indexes
      .map((index) => this.getCardElement(index))
      .join('')
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }
  },
  renderScore(score) {
    document.querySelector('.score').textContent = `Score : ${score}`
  },
  renderTriedTimes(times) {
    document.querySelector(
      '.tried'
    ).textContent = `You've tried : ${times} times`
  },

  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add('wrong')
      card.addEventListener('animationend', (event) => {
        event.target.classList.remove('wrong'), { once: true }
      })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
    <p>Complete!</p>
    <p>Score:${model.score}</p>
    <p>You've tried: ${model.tridTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  },
}

const utility = {
  getRandomNumberArray(count) {
    // 產生一個數字陣列
    const number = Array.from(Array(count).keys())
    // 從最後一個數字開始抽換
    for (let index = number.length - 1; index > 0; index--) {
      // 隨機取要換的index
      let randomIndex = Math.floor(Math.random() * (index + 1))
      // 運解構附值 替換
      ;[number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ]
    }
    return number
  },
}

const controller = {
  currentState: GAME_STATE.FirstCardAwaits,
  generateCards() {
    // 由 controller 來呼叫 utility.getRandomNumberArray，避免 view 和 utility 產生接觸
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {
    // 如果卡片是正面 不做任何動作
    if (!card.classList.contains('back')) {
      return
    }
    // 遊戲狀態控制
    switch (this.currentState) {
      // 當狀態是等待翻第一張卡
      case GAME_STATE.FirstCardAwaits:
        view.flipCards(card) //翻牌
        model.revealedCards.push(card) //把排加入revealedCards
        this.currentState = GAME_STATE.SecondCardAwaits //改變狀態
        break //用break 才會印後面console.log , 用return 會結束這個function
      case GAME_STATE.SecondCardAwaits:
        view.renderTriedTimes(++model.tridTimes)
        view.flipCards(card)
        model.revealedCards.push(card)
        // 判斷是否配對成功
        if (model.isReveledCardsMatched()) {
          // 配對成功
          view.renderScore((model.score += 10))
          this.currentState = GAME_STATE.CardsMatched
          view.pairCards(...model.revealedCards)
          model.revealedCards = []
          if (model.score === 260) {
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwaits
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchedFailed
          view.appendWrongAnimation(...model.revealedCards)
          setTimeout(this.resetCards, 1000)
        }

        break
    }
  },
  resetCards() {
    console.log(this) //window
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    //而把 resetCards 當成參數傳給 setTimeout 時，this 的對象變成了 setTimeout，而 setTimeout 又是一個由瀏覽器提供的東西，而不是我們自己定義在 controller 的函式。
    controller.currentState = GAME_STATE.FirstCardAwaits
  },
}

const model = {
  revealedCards: [],
  isReveledCardsMatched() {
    return (
      this.revealedCards[0].dataset.index % 13 ===
      this.revealedCards[1].dataset.index % 13
    )
  },
  score: 0,
  tridTimes: 0,
}

controller.generateCards()

// 監聽器
/**
 卡牌寫下事件，有兩種作法：
1.使用「事件委派」的技巧，在父元素 #cards 設定一個統一的監聽器，再用條件式找到正確的卡片
2. 為每一個 .card 產生監聽器，總共需要 52 個監聽器
 */
// Node list
document.querySelectorAll('.card').forEach((card) => {
  card.addEventListener('click', (event) => {
    controller.dispatchCardAction(card)
  })
})
