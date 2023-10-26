# CLS Detection and Screenshot Tool

A NodeJS script for automatically detecting Cumulative Layout Shifts (CLS) on web pages using Puppeteer and Lighthouse.

Features:
1, Navigates through a list of specified URLs.
2, Analyses each page for layout shifts using Lighthouse's built-in audit tools.
3, Captures and saves a screenshot of the current viewport, highlighting areas where layout shifts occur.
4, Automatically records layout shift data and saves it in a CSV format.
5, Allows for manual interaction to dismiss cookie banners or pop-ups on the first URL for better analysis.
6, Superimposes CLS score on the captured screenshot.

Usage:
Ideal for web developers and SEO specialists looking to understand and improve the visual stability of web pages. Feel free to modify the description as per your requirements.

Libraries:
1, puppeteer: A Node library that provides a high-level API to control headless Chrome or Chromium browsers.
2, fs: The built-in Node.js file system module, used for reading from and writing to the file system.
3, lighthouse: An open-source, automated tool for improving the quality of web pages. In your script, it's used to analyze and get metrics related to layout shifts.
    
npm install puppeteer lighthouse

