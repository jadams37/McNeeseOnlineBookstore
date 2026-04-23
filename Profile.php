<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Profile</title>

    <link rel="stylesheet" href="Profile.css">
    <link rel="stylesheet" href="css/shared.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&icon_names=search">
</head>
<body>

    <!-- Header -->
    <header>
            <nav class="nav-head">
                <div class="nav-start">
                    <div class="logo">
                        <a class="logo-label" href="homepage.html">McNeese Bookstore</a>
                    </div>
                </div>
                <div class="nav-center">
                    <form action="results.php" method="get">
                        <div class="search">
                            <span class="search-icon material-symbols-outlined">search</span>
                            <input class="search-input" type="text" name="search" placeholder="Search">
                        </div>
                    </form>
                </div>
                <div class="nav-end">
                    <div class="cart">
                        <a href="cart.html" class="cart-label">Cart</a>
                        <a href="cart.html" class="cart-icon"><img src="icons/cart.svg"></a>
                    </div>
                    <div class="separator"></div>
                    <div class="profile">
                        <a href="Profile.php" class="profile-label">Profile</a>
                        <a href="Profile.php" class="profile-icon"><img src="icons/profile.svg"></a>
                    </div>
                </div>
            </nav>
        </header>

    <!-- Main Content -->
    <article class="profile-page">
        <div class="profile-container">

            <div class="profile-left">
                <div class="profile-card">
                    <img src="images/user.jpg" alt="User" class="user-image">
                    <h2 class="user-name">Evan Robertson</h2>
                    <p class="user-email">erobertson2@mcneese.edu</p>
                    <button class="edit-button">Edit Profile</button>
                </div>

                <div class="profile-links">
                    <a href="#" class="profile-link active-link">Account Info</a>
                    <a href="#" class="profile-link">Orders</a>
                    <a href="#" class="profile-link">Settings</a>
                </div>
            </div>

            <div class="profile-right">
                <div class="info-box">
                    <h1 class="section-title">My Profile</h1>

                    <div class="info-row">
                        <div class="info-group">
                            <label>First Name</label>
                            <input type="text" value="Evan">
                        </div>

                        <div class="info-group">
                            <label>Last Name</label>
                            <input type="text" value="Robertson">
                        </div>
                    </div>

                    <div class="info-row">
                        <div class="info-group">
                            <label>Email</label>
                            <input type="email" value="erobertson2@mcneese.edu">
                        </div>

                        <div class="info-group">
                            <label>Phone</label>
                            <input type="text" value="(337) 607-9179">
                        </div>
                    </div>

                    <div class="info-row single-row">
                        <div class="info-group full-width">
                            <label>Address</label>
                            <input type="text" value="123 College Street, Lake Charles, LA">
                        </div>
                    </div>

                    <button class="save-button">Save Changes</button>
                </div>

                <div class="info-box">
                    <h2 class="section-subtitle">Recent Orders</h2>

                    <div class="order-item">
                        <p><strong>Order #10021</strong></p>
                        <p>Introduction to Java Programming</p>
                        <p>Status: Delivered</p>
                    </div>

                    <div class="order-item">
                        <p><strong>Order #10045</strong></p>
                        <p>Database Systems Concepts</p>
                        <p>Status: Shipped</p>
                    </div>
                </div>
            </div>

        </div>
    </article>

    <!-- Footer -->
    <footer>
            <nav class="nav-foot">
                <div class="foot-start">
                    <div class="contact">
                        <a class="contact-label" href="">Contact Us</a>
                        <a class="contact-subtext" href="">Having issues with your order? Have any questions?<br>Please reach out to us if so.</a>
                    </div>
                </div>
                <div class="foot-center">
                    <a class="hours-label">Store Hours</a>
                    <a class="hours-subtext">Monday - Wednesday: 7:30 AM - 5:00 PM<br>Thursday: 7:30 AM - 6:00 PM<br>Friday: 7:30 AM - 11:30 AM</a>
                </div>
                <div class="foot-end">
                    <a class="social-label">Follow Us</a>
                    <div class="social-links">
                        <a href="https://www.facebook.com" class="social-icon"><img src="icons/facebook.png" alt="Facebook"></a>
                        <a href="https://www.instagram.com" class="social-icon"><img src="icons/instagram.png" alt="Instagram"></a>
                        <a href="https://www.tiktok.com" class="social-icon"><img src="icons/tiktok.png" alt="TikTok"></a>
                    </div>
                </div>
            </nav>
        </footer>

</body>
</html>