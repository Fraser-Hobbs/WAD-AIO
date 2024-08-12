const {Builder, By, until} = require(`selenium-webdriver`);
const firefox = require(`selenium-webdriver/firefox`);
const path = require(`path`);
const fs = require(`fs`);

function printTestResults(testResults) {
    const bold = `\x1b[1m`;
    const reset = `\x1b[0m`;
    const green = `\x1b[32m`;
    const red = `\x1b[31m`;
    const yellow = `\x1b[33m`;
    const gray = `\x1b[90m`;
    const cyan = `\x1b[36m`;
    const line = `${gray}------------------------------------------------------${reset}`;

    const orderedCategories = [
        "Basic Test Suite",
        "Item Management Test Suite",
        "Admin Test Suite",
        "Manager Test Suite",
        "Volunteer Test Suite",
        "Deletion Test Suite",
    ];

    // Group the results by category
    const groupedResults = testResults.reduce((acc, result) => {
        acc[result.category] = acc[result.category] || [];
        acc[result.category].push(result);
        return acc;
    }, {});

    let passCount = 0;
    let failCount = 0;

    // Print each category in the specified order
    orderedCategories.forEach(category => {
        const results = groupedResults[category];
        if ( results ) {
            console.log(`${bold}${cyan}\n${category}${reset}`);
            console.log(line);

            // Header
            console.log(`${bold}  Test Name                              | Result  ${reset}`);
            console.log(line);

            results.forEach(result => {
                let color;
                if ( result.result === `Passed` ) {
                    color = green;
                    passCount++;
                } else if ( result.result === `Failed` ) {
                    color = red;
                    failCount++;
                } else {
                    color = yellow;
                }

                const testName = `${bold}${result.testName.padEnd(40, ` `)}${reset}`;  // Adjusted padding
                const testResult = `${color}${result.result.padEnd(8, ` `)}${reset}`;
                const message = result.message ? `${gray}Message: ${result.message}${reset}` : "";

                console.log(`  ${testName}| ${testResult} ${message}`);
            });

            console.log(line);
        }
    });

    // Summary
    console.log(`${bold}${cyan}\nTest Summary${reset}`);
    console.log(line);
    console.log(`${bold}  Passed: ${green}${passCount}${reset} | Failed: ${red}${failCount}${reset}${reset}`);
    console.log(line);
}


/**
 * Takes a screenshot and saves it to the ./screenshots directory.
 *
 * @param {object} driver - The WebDriver instance.
 * @param {string} filename - The name of the file (without extension).
 */
async function takeScreenshot(driver, filename) {
    try {
        // Ensure the screenshots directory exists
        const dir = path.join(__dirname, `screenshots`);
        if ( !fs.existsSync(dir) ) {
            fs.mkdirSync(dir, {recursive: true});
        }

        // Capture the screenshot
        let screenshot = await driver.takeScreenshot();

        // Define the full path for the screenshot
        const filePath = path.join(dir, `${filename}.png`);

        // Save the screenshot to the specified directory with the given filename
        fs.writeFileSync(filePath, screenshot, `base64`);
        console.log(`Screenshot taken and saved as ${filePath}`);
    } catch (err) {
        console.error(`Error taking screenshot: ${err.message}`);
    }
}


let testUrl = `http://webappdev.fraserhobbs.dev/`;
(async function testWebsite(url = testUrl) {
    // Set up the Firefox driver
    let driver = await new Builder()
        .forBrowser(`firefox`)
        .setFirefoxOptions(new firefox.Options())
        .build();

    let testResults = [];

    // Function to log test results with category
    function logResult(testName, result, category, message = "") {
        testResults.push({testName, result, category, message});
        console.log(`Category: ${category} | Test: ${testName} | Result: ${result} ${message ? "| Message: " + message : ""}`);
    }


    async function createItem(driver, adminUser = false, itemName, itemDescription, itemCost, storeName = null) {
        try {
            // Wait until the dashboard is loaded
            await driver.wait(until.elementLocated(By.css(`.flex-1 > app-manage-items:nth-child(2)`)), 10000);

            // Click the "Add New Item" button
            await driver.findElement(By.xpath("//button[contains(text(), 'Add New Item')]")).click();

            // Set Name
            await driver.findElement(By.xpath("//input[@type='text' and contains(@class, 'mt-1 block w-full p-2 border border-gray-300 rounded-md')]")).sendKeys(itemName);
            // Set Description
            await driver.findElement(By.xpath("/html/body/app-root/app-dashboard-layout/div/div/app-manage-items/div/app-item-modal/div/div/div[2]/textarea")).sendKeys(itemDescription);
            // Set Cost
            await driver.findElement(By.xpath("//input[@type='number' and contains(@class, 'mt-1 block w-full p-2 border border-gray-300 rounded-md')]")).sendKeys(itemCost);

            // Set Store If Admin
            if ( adminUser ) {
                const selectElement = await driver.findElement(By.xpath("//select[contains(@class, 'mt-1 block w-full p-2 border border-gray-300 rounded-md')]"));
                const options = await selectElement.findElements(By.xpath(".//option"));

                if ( storeName ) {
                    // Select the specific store if provided
                    for (let option of options) {
                        const text = await option.getText();
                        if ( text.trim() === storeName ) {
                            await option.click();
                            break;
                        }
                    }
                } else {
                    // Select a random store if no specific store is provided
                    const randomIndex = Math.floor(Math.random() * options.length);
                    await options[randomIndex].click();
                }
            }
            console.log(`Created Item: ${itemName}, Description: ${itemDescription}, Cost: ${itemCost}, Store: ${storeName}`);

            // Take a screenshot
            await takeScreenshot(driver, `add_item`);

            // Submit the form
            await driver.sleep(1000);
            await driver.findElement(By.xpath("//button[contains(@class, 'px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600') and text()='Save']")).click();

            // Locate the table rows
            const rows = await driver.findElements(By.xpath("//table[contains(@class, 'min-w-full bg-white border border-gray-200 rounded-lg')]/tbody/tr"));

            let itemFound = false;

            // Iterate through the rows and check for "Test Item" and value "10"
            for (let row of rows) {
                let finding_itemName = await row.findElement(By.xpath("./td[1]")).getText();
                let find_itemValue = await row.findElement(By.xpath("./td[3]")).getText();

                if ( finding_itemName === itemName && parseInt(find_itemValue) === itemCost ) {
                    itemFound = true;
                    logResult(`Create New Item - ${itemName}`, "Passed", "Item Management Test Suite");
                    break;
                }
            }

            if ( !itemFound ) {
                logResult("Create New Item", "Failed", "Item Management Test Suite", "Item not found in the table");
            }
        } catch (err) {
            logResult(`Create New Item ${itemName}`, "Failed", "Item Management Test Suite", err.message);
        }
    }

    async function adminTestFlow(driver) {

        // Find and fill in the login form
        await driver.findElement(By.name(`email`)).sendKeys(`admin@example.com`);
        await driver.findElement(By.name(`password`)).sendKeys(`password123`);
        await driver.findElement(By.css(`button[type="submit"]`)).click();
        logResult("Login as Admin", "Passed", "Admin Test Suite");

        // check current URL
        let currentURL = await driver.getCurrentUrl();
        if ( currentURL === `${url}dashboard/items` ) {
            logResult("Login Redirect", "Passed", "Admin Test Suite");
        }

        // Take a screenshot
        await takeScreenshot(driver, `admin_dashboard`);


        // Navigate to the Store Management page
        await driver.navigate().to(`${url}dashboard/`);
        await driver.sleep(500);
        await driver.findElement(By.xpath("//a[@href='/dashboard/stores' and contains(text(), 'Stores')]")).click();
        logResult("Navigate to Store Management Page", "Passed", "Admin Test Suite");

        await driver.sleep(500);

        // Click New Store
        await driver.findElement(By.xpath("//button[contains(text(), 'Add New Store')]")).click();


        // Fill in the form
        await driver.findElement(By.xpath("//input[@formcontrolname='name' and @type='text' and contains(@class, 'mt-1')]")).sendKeys(`Selenium Test Store`);
        await driver.findElement(By.xpath("//input[@formcontrolname='address' and @type='text' and contains(@class, 'mt-1')]")).sendKeys(`Selenium Test Address`);

        // Take a screenshot
        await takeScreenshot(driver, `add_store_form`);

        // Submit the form
        await driver.findElement(By.xpath("//button[@type='submit' and contains(text(), 'Create') and contains(@class, 'bg-blue-500')]")).click();
        logResult("Create New Store", "Passed", "Admin Test Suite");

        // Take a screenshot
        await takeScreenshot(driver, `add_store_submitted`);

        // Create Store Manager

        // Navigate to the User Management page
        await driver.navigate().to(`${url}dashboard/`);
        await driver.sleep(500);
        await driver.findElement(By.xpath("//a[@href='/dashboard/users' and contains(text(), 'Users')]")).click();
        logResult("Navigate to User Management Page", "Passed", "Admin Test Suite");

        // Click Add New User
        await driver.findElement(By.xpath("//button[contains(text(), 'Add New User')]")).click();

        // Fill in the form
        await driver.findElement(By.xpath("//input[@formcontrolname='firstName' and @type='text']")).sendKeys(`Selenium`);
        await driver.findElement(By.xpath("//input[@formcontrolname='lastName' and @type='text']")).sendKeys(`Manager`);
        await driver.findElement(By.xpath("//input[@formcontrolname='email' and @type='email']")).sendKeys(`Selenium.Manager@example.com`);
        await driver.findElement(By.xpath("//select[@formcontrolname='role']//option[@value='manager']")).click();
        await driver.findElement(By.xpath("//select[@formcontrolname='storeId']//option[contains(text(), 'Selenium Test Store')]")).click();
        await driver.findElement(By.xpath("//input[@formcontrolname='password' and @type='password']")).sendKeys(`SeleniumManager123`);

        // Take a screenshot
        await takeScreenshot(driver, `add_manager_as_admin`);

        await driver.findElement(By.xpath("//button[@type='submit' and contains(text(), 'Create') and contains(@class, 'bg-blue-500')]")).click();
        logResult("Create New User - Manager", "Passed", "Admin Test Suite");



        // Click Add New User
        await driver.findElement(By.xpath("//button[contains(text(), 'Add New User')]")).click();

        // Fill in the form
        await driver.findElement(By.xpath("//input[@formcontrolname='firstName' and @type='text']")).sendKeys(`Selenium`);
        await driver.findElement(By.xpath("//input[@formcontrolname='lastName' and @type='text']")).sendKeys(`Volunteer`);
        await driver.findElement(By.xpath("//input[@formcontrolname='email' and @type='email']")).sendKeys(`Selenium.Volunteer@example.com`);

        await driver.findElement(By.xpath("//select[@formcontrolname='role']//option[@value='volunteer']")).click();
        await driver.findElement(By.xpath("//select[@formcontrolname='storeId']//option[contains(text(), 'Selenium Test Store')]")).click();

        await driver.findElement(By.xpath("//input[@formcontrolname='password' and @type='password']")).sendKeys(`SeleniumVolunteer123`);
        await driver.findElement(By.xpath("//button[@type='submit' and contains(text(), 'Create') and contains(@class, 'bg-blue-500')]")).click();
        logResult("Create New User - Volunteer", "Passed", "Admin Test Suite");

        // Navigate to the Item Management page
        await driver.navigate().to(`${url}dashboard/`);
        await driver.sleep(500);

        // check current URL
        currentURL = await driver.getCurrentUrl();
        if ( currentURL === `${url}dashboard/items` ) {
            logResult("Navigate to Item Management Page", "Passed", "Admin Test Suite");
        }

        // Admin Create Item For Specific Store
        await createItem(driver, true, "Selenium Test(A) Phone", "Selenium Phone", 300, "Selenium Test Store");
        await createItem(driver, true, "Selenium Test(A) Laptop", "Selenium Laptop", 1000, "Selenium Test Store");
        await createItem(driver, true, "Selenium Test(A) Watch", "Selenium Watch", 200, "Selenium Test Store");
        logResult("Create Item For Specific Store", "Passed", "Admin Test Suite");

        // Admin logging out
        await driver.findElement(By.linkText(`Logout`)).click();
        // Verify that the user is logged out
        await driver.findElement(By.linkText(`Login`));
        logResult("Logout", "Passed", "Admin Test Suite");
    }

    async function managerTestFlow(driver) {
        // Navigate to the login page
        await driver.navigate().to(`${url}login`);

        // Find and fill in the login form
        await driver.findElement(By.name(`email`)).sendKeys(`Selenium.Manager@example.com`);
        await driver.findElement(By.name(`password`)).sendKeys(`SeleniumManager123`);
        await driver.findElement(By.css(`button[type="submit"]`)).click();
        logResult("Login as Manager", "Passed", "Manager Test Suite");

        // check current URL
        let currentURL = await driver.getCurrentUrl();
        if ( currentURL === `${url}dashboard/items` ) {
            logResult("Login Redirect", "Passed", "Manager Test Suite");
        }

        // Take a screenshot
        await driver.sleep(500);
        await takeScreenshot(driver, `manager_dashboard`);

        // Navigate to the User Management page
        await driver.navigate().to(`${url}dashboard/`);
        await driver.sleep(500);
        await driver.findElement(By.xpath("//a[@href='/dashboard/users' and contains(text(), 'Users')]")).click();
        logResult("Navigate to User Management Page", "Passed", "Manager Test Suite");

        // Click Add New User
        await driver.findElement(By.xpath("//button[contains(text(), 'Add New User')]")).click();

        // Fill in the form
        await driver.findElement(By.xpath("//input[@formcontrolname='firstName' and @type='text']")).sendKeys(`Selenium`);
        await driver.findElement(By.xpath("//input[@formcontrolname='lastName' and @type='text']")).sendKeys(`Manager2`);
        await driver.findElement(By.xpath("//input[@formcontrolname='email' and @type='email']")).sendKeys(`Selenium.Manager2@example.com`);
        await driver.findElement(By.xpath("//select[@formcontrolname='role']//option[@value='volunteer']")).click();
        await driver.findElement(By.xpath("//input[@formcontrolname='password' and @type='password']")).sendKeys(`SeleniumManager123`);
        await driver.findElement(By.xpath("//button[@type='submit' and contains(text(), 'Create') and contains(@class, 'bg-blue-500')]")).click();
        logResult("Create New User - Manager", "Passed", "Manager Test Suite");

        // Click Add New User
        await driver.findElement(By.xpath("//button[contains(text(), 'Add New User')]")).click();

        // Fill in the form
        await driver.findElement(By.xpath("//input[@formcontrolname='firstName' and @type='text']")).sendKeys(`Selenium`);
        await driver.findElement(By.xpath("//input[@formcontrolname='lastName' and @type='text']")).sendKeys(`Volunteer2`);
        await driver.findElement(By.xpath("//input[@formcontrolname='email' and @type='email']")).sendKeys(`Selenium.Volunteer2@example.com`);
        await driver.findElement(By.xpath("//select[@formcontrolname='role']//option[@value='volunteer']")).click();
        await driver.findElement(By.xpath("//input[@formcontrolname='password' and @type='password']")).sendKeys(`SeleniumVolunteer123`);

        // Take a screenshot
        await takeScreenshot(driver, `add_volunteer_as_manager`);

        await driver.findElement(By.xpath("//button[@type='submit' and contains(text(), 'Create') and contains(@class, 'bg-blue-500')]")).click();
        logResult("Create New User - Volunteer", "Passed", "Manager Test Suite");

        // Navigate to the Item Management page
        await driver.navigate().to(`${url}dashboard/`);
        await driver.sleep(500);

        // check current URL
        currentURL = await driver.getCurrentUrl();
        if ( currentURL === `${url}dashboard/items` ) {
            logResult("Navigate to Item Management Page", "Passed", "Manager Test Suite");
        }

        // Manager Create Item
        await createItem(driver, false, "Selenium Test(M) Phone", "Selenium Phone", 300);
        await createItem(driver, false, "Selenium Test(M) Laptop", "Selenium Laptop", 1000);
        await createItem(driver, false, "Selenium Test(M) Watch", "Selenium Watch", 200);
        logResult("Create Items", "Passed", "Manager Test Suite");

        // Manager logging out
        await driver.findElement(By.linkText(`Logout`)).click();
        // Verify that the user is logged out
        await driver.findElement(By.linkText(`Login`));
        logResult("Logout", "Passed", "Manager Test Suite");

    }

    async function volunteerTestFlow(driver) {

        // Find and fill in the login form
        await driver.findElement(By.name(`email`)).sendKeys(`Selenium.Volunteer@example.com`);
        await driver.findElement(By.name(`password`)).sendKeys(`SeleniumVolunteer123`);
        await driver.findElement(By.css(`button[type="submit"]`)).click();
        logResult("Login as Volunteer", "Passed", "Volunteer Test Suite");

        // check current URL
        let currentURL = await driver.getCurrentUrl();
        if ( currentURL === `${url}dashboard/items` ) {
            logResult("Login Redirect", "Passed", "Volunteer Test Suite");
        }

        // Take a screenshot
        await driver.sleep(500);
        await takeScreenshot(driver, `volunteer_dashboard`);

        // Volunteer Create Items
        await createItem(driver, false, "Selenium Test(V) Phone", "Selenium Phone", 300);
        await createItem(driver, false, "Selenium Test(V) Laptop", "Selenium Laptop", 1000);
        await createItem(driver, false, "Selenium Test(V) Watch", "Selenium Watch", 200);
        logResult("Create Items", "Passed", "Volunteer Test Suite");

        // Volunteer logging out
        await driver.findElement(By.linkText(`Logout`)).click();
        // Verify that the user is logged out
        await driver.findElement(By.linkText(`Login`));
        logResult("Logout", "Passed", "Volunteer Test Suite");
    }

    async function deleteTestData(driver) {

        // Find and fill in the login form
        await driver.findElement(By.name(`email`)).sendKeys(`admin@example.com`);
        await driver.findElement(By.name(`password`)).sendKeys(`password123`);
        await driver.findElement(By.css(`button[type="submit"]`)).click();

        // Go to Store Management
        await driver.findElement(By.xpath("//a[@href='/dashboard/stores' and contains(text(), 'Stores')]")).click();

        // Delete Store
        // Locate the row containing "Selenium Test Store" and then find the "Delete" button within that row
        await driver.findElement(By.xpath("//tr[td[contains(text(), 'Selenium Test Store')]]//button[contains(text(), 'Delete')]")).click();

        // Confirm the delete action
        await driver.findElement(By.xpath("//button[contains(text(), 'Delete') and contains(@class, 'px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600')]")).click();
        logResult("Delete Store", "Passed", "Deletion Test Suite");
    }

    try {
        // Open the website
        await driver.get(`${url}`);
        logResult("Open Website", "Passed", "Basic Test Suite");

        // Take a screenshot
        await takeScreenshot(driver, `home_page`);

        // Navigate to the About page
        await driver.navigate().to(`${url}about/`);
        logResult("Navigate to About Page", "Passed", "Basic Test Suite");

        // Take a screenshot
        await driver.sleep(500);
        await takeScreenshot(driver, `about_page`);

        // Navigate to the Browse page
        await driver.navigate().to(`${url}browse/`);
        logResult("Navigate to Browse Page", "Passed", "Basic Test Suite");

        // Take a screenshot
        await driver.sleep(500);
        await takeScreenshot(driver, `browse_page`);

        // Navigate to the login page
        await driver.navigate().to(`${url}login`);
        logResult("Navigate to Login Page", "Passed", "Basic Test Suite");

        // Take a screenshot
        await driver.sleep(500);
        await takeScreenshot(driver, `login_page`);

        // Admin Test Suite
        await adminTestFlow(driver);

        // Manager Test Suite
        await managerTestFlow(driver);

        // Volunteer Test Suite
        await volunteerTestFlow(driver);

        // Navigate to the Browse page
        await driver.navigate().to(`${url}browse/`);
        logResult("Navigate to Browse Page", "Passed", "Basic Test Suite");

        // Take a screenshot
        await driver.sleep(500);
        await takeScreenshot(driver, `browse_page_final`);

        // Navigate to the login page
        await driver.navigate().to(`${url}login`);

        // Delete Test Data
        await deleteTestData(driver);


    } catch (err) {
        logResult("Test Execution", "Failed", "Test Suite Execution", err.message);
    } finally {
        // Close the browser
        await driver.quit();

        // Print the test results
        printTestResults(testResults);
    }
})();
