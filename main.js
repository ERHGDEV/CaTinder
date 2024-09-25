const DECISION_THRESHOLD = 75
let isAnimating = false
let pullDeltaX = 0
let catData = []  

async function fetchCats(limit = 10) {
    try {
        const response = await fetch(`https://api.thecatapi.com/v1/images/search?limit=${limit}`)
        const data = await response.json()
        return data
    } catch (error) {
        console.error("Error fetching cat data:", error)
    }
}

function createCard(cat) {
    const card = document.createElement('article')
    card.innerHTML = `
        <img src="${cat.url}" alt="Gato">
        <h2>Gato <span>${Math.floor(Math.random() * 10) + 1}</span></h2>
        <div class="choice nope">NOPE</div>
        <div class="choice like">LIKE</div>
    `
    document.querySelector('.cards').appendChild(card)
}

function startDrag(e) {
    if (isAnimating) return

    const actualCard = e.target.closest('article')
    if (!actualCard) return

    const startX = e.pageX ?? e.touches[0].pageX

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onEnd)
    document.addEventListener('touchmove', onMove, { passive: true })
    document.addEventListener('touchend', onEnd, { passive: true })

    function onMove(e) {
        const currentX = e.pageX ?? e.touches[0].pageX
        pullDeltaX = currentX - startX

        if (pullDeltaX === 0) return

        isAnimating = true
        const deg = pullDeltaX / 10

        actualCard.style.transform = `translateX(${pullDeltaX}px) rotate(${deg}deg)`
        actualCard.style.cursor = 'grabbing'

        const opacity = Math.abs(pullDeltaX) / 100
        const isRight = pullDeltaX > 0

        const choiceEl = isRight
            ? actualCard.querySelector('.choice.like')
            : actualCard.querySelector('.choice.nope')

        choiceEl.style.opacity = opacity
    }

    function onEnd() {
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onEnd)
        document.removeEventListener('touchmove', onMove)
        document.removeEventListener('touchend', onEnd)

        const decisionMade = Math.abs(pullDeltaX) >= DECISION_THRESHOLD

        if (decisionMade) {
            const goRight = pullDeltaX > 0

            actualCard.classList.add(goRight ? 'go-right' : 'go-left')
            actualCard.addEventListener('transitionend', () => {
                actualCard.remove()
                if (document.querySelector('.cards').children.length === 0) {
                    document.querySelector('.no-more-cats').style.display = 'block'
                }
            }, { once: true })
        } else {
            actualCard.classList.add('reset')
            actualCard.classList.remove('go-left', 'go-right')
        }

        actualCard.addEventListener('transitionend', () => {
            actualCard.removeAttribute('style')
            actualCard.classList.remove('reset')

            pullDeltaX = 0
            isAnimating = false
        })

        actualCard.querySelectorAll('.choice').forEach(el => el.style.opacity = 0)
    }
}

document.addEventListener('mousedown', startDrag)
document.addEventListener('touchstart', startDrag, { passive: true })

document.addEventListener('DOMContentLoaded', async () => {
    catData = await fetchCats() 
    catData.forEach(cat => createCard(cat)) 
})
