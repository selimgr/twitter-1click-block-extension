import './style.css'
import 'webextension-polyfill'
import { blockIconSVG } from './svg-icon.js'

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
  const isLogged = document.querySelector('a[data-testid="AppTabBar_Profile_Link"]') != null
  if (!isLogged) return

  // Retrieve the tweets
  let tweets = [...document.getElementsByTagName('article')]
  tweets = tweets.filter((tweet) => tweet.getAttribute('data-testid') === 'tweet' && tweet.getAttribute('data-blockButton') !== 'true' && !tweet.querySelector('[data-testid="block-btn"]'))

  // Inject the button
  tweets.forEach(tweet => {
    // Checks the author
    if (!tweet.querySelectorAll('div[data-testid="User-Name"] a[role="link"]') || tweet.querySelectorAll('div[data-testid="User-Name"] a[role="link"]').length < 1) return
    const author = tweet.querySelectorAll('div[data-testid="User-Name"] a[role="link"]')[1].textContent
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

// Using MutationObserver to listen for changes and inject the block buttons
const observer = new MutationObserver(injectBlockButtons)
observer.observe(document.body, {
  childList: true, subtree: true
})
