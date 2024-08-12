
# Selenium Test Automation Script

This repository contains automated tests for the Charity Shop Web Application. The tests are designed to verify the functionality of various features across different user roles, including Admin, Manager, and Volunteer.

## Prerequisites

Before running the script, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (version 14.x or later)
- [Firefox browser](https://www.mozilla.org/firefox/new/)
- [GeckoDriver](https://github.com/mozilla/geckodriver/releases) (Make sure `geckodriver` is accessible in your system's PATH)

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/selenium-test-automation.git
   cd selenium-test-automation
   ```

2. **Install dependencies:**

   Navigate to the project directory and run the following command to install the required npm packages:

   ```bash
   npm install
   ```

   This will install all the dependencies listed in the `package.json` file, including Selenium WebDriver.

## Configuration

The test script is configured to run against a specific web application URL. If you need to test against a different URL, you can modify the `testUrl` variable in the script.

```javascript
let testUrl = `http://webappdev.fraserhobbs.dev/`;
```

## Running the Tests

To execute the test suite, follow these steps:

1. **Ensure Firefox and GeckoDriver are properly installed and configured.**

2. **Run the test script:**

   ```bash
   node testScript.js
   ```

   This will launch Firefox, navigate through the web application, and perform the tests as described in the script. The script will automatically log in as different users, perform various actions, and then log the results.

## Test Flow

The script performs the following test scenarios:

1. **Basic Test Suite:**
    - Opens the website.
    - Navigates to the About and Browse pages.
    - Takes screenshots of each page.

2. **Admin Test Suite:**
    - Logs in as Admin.
    - Creates a new store and users (Manager and Volunteer).
    - Adds items to the store.
    - Logs out.

3. **Manager Test Suite:**
    - Logs in as a Manager.
    - Adds users (Volunteer).
    - Adds items to the store.
    - Logs out.

4. **Volunteer Test Suite:**
    - Logs in as a Volunteer.
    - Adds items to the store.
    - Logs out.

5. **Deletion Test Suite:**
    - Logs in as Admin.
    - Deletes the test data (store and users).

## Viewing the Results

The test results are printed to the console in a formatted manner. Each test's outcome (Passed/Failed) is grouped by category and presented in an easy-to-read format.

Additionally, screenshots are taken during key points of the test execution and saved in the `./screenshots` directory for further analysis.

## Troubleshooting

- **Common Issues:**
    - Ensure that GeckoDriver is in your system's PATH.
    - Make sure that the URL being tested is accessible and that the web application is running.

- **Error Handling:**
    - The script includes error handling to capture and log issues during test execution. If a test fails, the error message is logged for review.

## License

This project is licensed under the MIT License.

---

Feel free to modify the script to suit your testing needs. If you encounter any issues, please open an issue on the repository or reach out for support.
