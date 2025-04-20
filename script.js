// function to run the order API
async function runOrder() {
  try {
    // get the ingredient choice
    let ingredient = prompt(
      "Enter a main ingredient for the chef's favourite meal:"
    );

    // format the ingredient for the API
    const formattedIngredient = ingredient
      .trim()
      .toLowerCase()
      .replace(/ /g, "_");

    // fetch meals with the ingredient using the Meal DB API
    let response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?i=${formattedIngredient}`
    );

    // check if the response is ok otherwise throw an error
    if (!response.ok) {
      throw new Error(
        `Unable to fetch meals containing "${ingredient}", please try again later.`
      );
    }

    // format the response
    let result = await response.json();

    // if no meals with the ingredient found, ask for another ingredient
    if (result.meals === null || result.meals.length === 0) {
      alert(
        `No meals found for "${ingredient}". Please try another ingredient.`
      );
      return await runOrder(); // recursive call to the runOrder function again
    }

    // pick a random meal from the result list
    const randomMeal =
      result.meals[Math.floor(Math.random() * result.meals.length)];

    // set last order number or default to 0
    let lastOrderNumber =
      parseInt(sessionStorage.getItem("lastOrderNumber")) || 0;

    // set the next order number for session storage
    let nextOrderNumber = lastOrderNumber + 1;

    // create the new order object
    let newOrder = {
      orderNumber: nextOrderNumber,
      description: randomMeal.strMeal,
      completed: false,
    };

    // get current orders from session storage or default to empty array if none
    let storedOrders = JSON.parse(sessionStorage.getItem("orders")) || [];

    // add the new order to the storedOrders list
    storedOrders.push(newOrder);

    // add the updated orders list to session storage
    sessionStorage.setItem("orders", JSON.stringify(storedOrders));

    // add the last order number (index) to the session storage
    sessionStorage.setItem("lastOrderNumber", nextOrderNumber.toString());

    // alert the user of their order details
    alert(
      `Order placed successfully!\n\nOrder #${newOrder.orderNumber}: ${newOrder.description}`
    );
  } catch (error) {
    // handle any errors and log them
    console.log(`An error occured: ${error.message}`);
  }
}

// function to complete an order
function completeOrder() {
  // get the stored orders from the session storage
  let storedOrders = JSON.parse(sessionStorage.getItem("orders")) || [];

  // filter for incomplete orders
  let incompleteOrders = storedOrders.filter((order) => !order.completed);

  // if there are no imcomplete orders tell the user and exit
  if (incompleteOrders.length === 0) {
    alert("There are no incomplete orders.");
    return;
  }

  // build the display string of incomplete orders
  let message = "Incomplete Orders:\n\n";
  incompleteOrders.forEach((order) => {
    message += `Order #${order.orderNumber}: ${order.description}\n`;
  });
  message += "\nEnter the order number to mark as complete or 0 to skip.";

  // ask the user to mark an order complete or skip
  let userOrderNumberChoice = prompt(message);
  let orderNumber = parseInt(userOrderNumberChoice);

  // check if the user wants to skip
  if (orderNumber === 0) {
    alert("No order was completed.");
    return;
  }

  // find the selected order
  let orderToUpdate = storedOrders.find(
    (order) => order.orderNumber === orderNumber
  );

  // if the order exists and is not completed
  if (orderToUpdate && !orderToUpdate.completed) {
    // mark the order completed
    orderToUpdate.completed = true;
    // update the order in session storage
    sessionStorage.setItem("orders", JSON.stringify(storedOrders));
    // tell the user the order was completed
    alert(`Order #${orderNumber} marked as completed.`);
  } else {
    // unable to complete order, tell the user
    alert(`Order #${orderNumber} not found or already completed.`);
  }
}

// function to run the order functions in order
async function processOrders() {
  await runOrder();
  completeOrder();
}

// run the program
processOrders();
