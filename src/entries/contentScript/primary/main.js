import './style.css'
import 'webextension-polyfill'

const blockIconSVG = '<svg viewBox="0 0 24 24" class="r-4qtqp9 r-yyyyoo r-50lct3 r-dnmrzs r-bnwqim r-1plcrui r-lrvibr r-1srniue"><path d="M12 4.7561C8.00488 4.7561 4.7561 7.9961 4.7561 12C4.7561 13.6859 5.33561 15.2312 6.29268 16.4605L16.4693 6.29268C15.2312 5.32683 13.6859 4.7561 12 4.7561ZM17.7073 7.53951L7.53951 17.7073C8.76878 18.6732 10.3141 19.2439 12 19.2439C16.0039 19.2439 19.2439 16.0039 19.2439 12C19.2439 10.3141 18.6732 8.76878 17.7073 7.53951ZM3 12C3 7.03024 7.03024 3 12 3C16.9698 3 21 7.03024 21 12C21 16.9698 16.9698 21 12 21C7.03024 21 3 16.9698 3 12Z"/></svg>'
let currentUsername = null

/**
 * Fetch the username
 * @returns {null|string}
 */
const fetchUsername = () => {
  if (currentUsername != null) return currentUsername // use cache
  currentUsername = [...document.querySelectorAll('div[data-testid="SideNav_AccountSwitcher_Button"] span')].pop()?.textContent ?? null
  return currentUsername
}

/**
 * Block the user
 * @param {Event} event
 */
function blockUser (event) {
  const src = event.target

  const tweet = src.closest('article[data-blockButton=true]')
  if (!tweet) return

  const tweetCaret = tweet.querySelector('div[data-testid="caret"]')
  if (!tweetCaret) return

  tweetCaret.click()
  document.querySelector('div[role="menuitem"][data-testid="block"]').click()
  document.querySelector('div[data-testid="confirmationSheetConfirm"]').click()
}

/**
 * Inject the block buttons
 */
function injectBlockButtons () {
  // Retrieve the tweets
  let tweets = [...document.getElementsByTagName('article')]
  tweets = tweets.filter((tweet) => tweet.getAttribute('data-testid') === 'tweet' && tweet.getAttribute('data-blockButton') !== 'true' && !tweet.querySelector('[data-testid="block-btn"]'))

  // Inject the button
  tweets.forEach(tweet => {
    // Checks the author
    if (!tweet.querySelectorAll('div[data-testid="User-Names"] a[role="link"]') || tweet.querySelectorAll('div[data-testid="User-Names"] a[role="link"]').length < 1) return
    const author = tweet.querySelectorAll('div[data-testid="User-Names"] a[role="link"]')[1].textContent
    if (author === fetchUsername()) return

    // Get icons
    const actionBar = tweet.querySelector('div[role="group"]:last-child')
    const actionIcons = actionBar.children

    // Copy favIcon
    const blockIcon = actionIcons[2].cloneNode(true)
    const firstDiv = blockIcon.querySelector('div')
    firstDiv.setAttribute('data-testid', 'block-btn')
    firstDiv.setAttribute('aria-label', 'Block')

    const svgIcon = blockIcon.querySelector('svg')
    svgIcon.innerHTML = blockIconSVG
    if (svgIcon.parentNode.nextSibling) svgIcon.parentNode.nextSibling.style.display = 'none'

    blockIcon.onclick = blockUser

    // Mark as already injected BEFORE inserting... otherwise it will loop!
    tweet.setAttribute('data-blockButton', 'true')
    // Insert the block icon
    actionBar.insertBefore(blockIcon, actionIcons[3])
  })
}

document.addEventListener('DOMContentLoaded', injectBlockButtons)
document.addEventListener('DOMNodeInserted', injectBlockButtons)
