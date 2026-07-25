export default defineBackground(() => {
  console.log('Hello background!', { id: browser.runtime.id });

  browser.browserAction.onClicked.addListener(tab => {
    console.log('clicked');
  });
});
