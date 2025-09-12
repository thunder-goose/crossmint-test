<div align="center">
<img width="200" alt="Image" src="https://github.com/user-attachments/assets/8b617791-cd37-4a5a-8695-a7c9018b7c70" />
<br>
<br>
<h1>Wallets Server Quickstart</h1>

<div align="center">
<a href="https://docs.crossmint.com/introduction/platform/wallets">Docs</a> | <a href="https://github.com/crossmint">See all quickstarts</a>
</div>

<br>
<br>
</div>

## Introduction

Create and interact with Crossmint wallets creating all transactions on the server side and only using the client to sign with a non-custodial signer.

This quickstart uses Crossmint Auth and uses your email as a signer for that wallet.

**Learn how to:**

- Create a wallet
- View its balance for USDC
- Create a send USDC transaction from the server
- Sign a transaction with a non-custodial signer on the client

## Setup

1. Clone the repository and navigate to the project folder:

```bash
git clone https://github.com/crossmint/wallets-server-quickstart.git && cd wallets-server-quickstart
```

2. Install all dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Set up the environment variables:

```bash
cp .env.template .env
```

4. Get a Crossmint client API key from [here](https://docs.crossmint.com/introduction/platform/api-keys/client-side) and add it to the `.env` file. Make sure your API key has the following scopes: `users.create`, `users.read`, `wallets.read`, `wallets.create`, `wallets:transactions.create`, `wallets:transactions.sign`, `wallets:balance.read`, `wallets.fund`.

```bash
NEXT_PUBLIC_CROSSMINT_API_KEY=your_api_key
```

5. Get a Crossmint server API key from [here](https://docs.crossmint.com/introduction/platform/api-keys/server-side) and add it to the `.env` file. Make sure your API key has the following scopes: `wallets.read` and `wallets:transactions.create`.

```bash
CROSSMINT_SERVER_API_KEY=your_api_key
```

6. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Single Sign-On (SSO) Implementation

This project implements SSO using Kinde Auth with proper OAuth 2.0 flow. For implementing SSO across multiple applications, each app needs to handle the OAuth flow correctly with proper state parameter generation.

### PHP Implementation Example

For PHP applications that need to integrate with the same Kinde SSO setup, here's a complete implementation example:

#### 1. Environment Configuration

```php
<?php
// config.php
return [
    'kinde' => [
        'client_id' => $_ENV['KINDE_CLIENT_ID'] ?? 'your_client_id',
        'client_secret' => $_ENV['KINDE_CLIENT_SECRET'] ?? 'your_client_secret',
        'issuer_url' => $_ENV['KINDE_ISSUER_URL'] ?? 'https://qoin-stg.eu.kinde.com',
        'redirect_uri' => $_ENV['KINDE_SITE_URL'] . '/auth/callback',
        'post_logout_redirect_uri' => $_ENV['KINDE_SITE_URL'] ?? 'https://your-php-app.com',
    ]
];
?>
```

#### 2. OAuth Helper Class

```php
<?php
// KindeAuth.php
class KindeAuth {
    private $config;

    public function __construct($config) {
        $this->config = $config['kinde'];
    }

    /**
     * Generate a secure state parameter for OAuth
     */
    private function generateSecureState(): string {
        return bin2hex(random_bytes(16)); // 32 characters
    }

    /**
     * Generate Kinde authorization URL with proper state parameter
     */
    public function getAuthUrl(array $options = []): string {
        $state = $options['state'] ?? $this->generateSecureState();

        // Store state in session for verification
        $_SESSION['oauth_state'] = $state;

        $params = [
            'client_id' => $this->config['client_id'],
            'redirect_uri' => $this->config['redirect_uri'],
            'response_type' => 'code',
            'scope' => 'openid profile email',
            'state' => $state,
        ];

        // Add optional parameters
        if (isset($options['prompt'])) {
            $params['prompt'] = $options['prompt'];
        }

        $baseUrl = $this->config['issuer_url'] . '/oauth2/auth';
        return $baseUrl . '?' . http_build_query($params);
    }

    /**
     * Generate logout URL
     */
    public function getLogoutUrl(array $options = []): string {
        $params = [
            'redirect' => $options['post_logout_redirect_uri'] ?? $this->config['post_logout_redirect_uri']
        ];

        $baseUrl = $this->config['issuer_url'] . '/logout';
        return $baseUrl . '?' . http_build_query($params);
    }

    /**
     * Exchange authorization code for tokens
     */
    public function exchangeCodeForTokens(string $code, string $state): array {
        // Verify state parameter
        if (!isset($_SESSION['oauth_state']) || $_SESSION['oauth_state'] !== $state) {
            throw new Exception('Invalid state parameter');
        }

        // Clear the state from session
        unset($_SESSION['oauth_state']);

        $tokenUrl = $this->config['issuer_url'] . '/oauth2/token';

        $postData = [
            'grant_type' => 'authorization_code',
            'client_id' => $this->config['client_id'],
            'client_secret' => $this->config['client_secret'],
            'code' => $code,
            'redirect_uri' => $this->config['redirect_uri'],
        ];

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $tokenUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/x-www-form-urlencoded',
            'Accept: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception('Token exchange failed: ' . $response);
        }

        return json_decode($response, true);
    }

    /**
     * Get user info from access token
     */
    public function getUserInfo(string $accessToken): array {
        $userInfoUrl = $this->config['issuer_url'] . '/oauth2/user';

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $userInfoUrl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $accessToken,
            'Accept: application/json'
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200) {
            throw new Exception('Failed to get user info: ' . $response);
        }

        return json_decode($response, true);
    }
}
?>
```

#### 3. Usage Examples

```php
<?php
// login.php
session_start();
require_once 'config.php';
require_once 'KindeAuth.php';

$config = include 'config.php';
$kindeAuth = new KindeAuth($config);

// Redirect to Kinde for authentication
$authUrl = $kindeAuth->getAuthUrl([
    'prompt' => 'none' // For SSO behavior
]);

header('Location: ' . $authUrl);
exit;
?>
```

```php
<?php
// auth/callback.php
session_start();
require_once '../config.php';
require_once '../KindeAuth.php';

$config = include '../config.php';
$kindeAuth = new KindeAuth($config);

try {
    $code = $_GET['code'] ?? null;
    $state = $_GET['state'] ?? null;

    if (!$code || !$state) {
        throw new Exception('Missing authorization code or state');
    }

    // Exchange code for tokens
    $tokens = $kindeAuth->exchangeCodeForTokens($code, $state);

    // Get user information
    $userInfo = $kindeAuth->getUserInfo($tokens['access_token']);

    // Store tokens and user info in session
    $_SESSION['access_token'] = $tokens['access_token'];
    $_SESSION['id_token'] = $tokens['id_token'] ?? null;
    $_SESSION['user'] = $userInfo;

    // Redirect to dashboard or home page
    header('Location: /dashboard.php');
    exit;

} catch (Exception $e) {
    // Handle error
    error_log('OAuth callback error: ' . $e->getMessage());
    header('Location: /login.php?error=' . urlencode($e->getMessage()));
    exit;
}
?>
```

```php
<?php
// logout.php
session_start();
require_once 'config.php';
require_once 'KindeAuth.php';

$config = include 'config.php';
$kindeAuth = new KindeAuth($config);

// Clear session
session_destroy();

// Redirect to Kinde logout
$logoutUrl = $kindeAuth->getLogoutUrl();
header('Location: ' . $logoutUrl);
exit;
?>
```

#### 4. Middleware for Protected Routes

```php
<?php
// middleware/auth.php
function requireAuth() {
    session_start();

    if (!isset($_SESSION['access_token']) || !isset($_SESSION['user'])) {
        header('Location: /login.php');
        exit;
    }

    return $_SESSION['user'];
}

// Usage in protected pages:
// require_once 'middleware/auth.php';
// $user = requireAuth();
?>
```

### PHP Implementation Using Kinde PHP SDK

For a more streamlined approach, you can use the official [Kinde PHP SDK](https://docs.kinde.com/developer-tools/sdks/backend/php-sdk/) which handles much of the OAuth complexity for you.

#### 1. Installation

First, install the Kinde PHP SDK using Composer:

```bash
composer require kinde-oss/kinde-auth-php
```

#### 2. Environment Configuration

```php
<?php
// config.php
return [
    'kinde' => [
        'domain' => $_ENV['KINDE_DOMAIN'] ?? 'https://qoin-stg.eu.kinde.com',
        'client_id' => $_ENV['KINDE_CLIENT_ID'] ?? 'your_client_id',
        'client_secret' => $_ENV['KINDE_CLIENT_SECRET'] ?? 'your_client_secret',
        'redirect_uri' => $_ENV['KINDE_SITE_URL'] . '/auth/callback',
        'logout_redirect_uri' => $_ENV['KINDE_SITE_URL'] ?? 'https://your-php-app.com',
        'scope' => 'openid profile email'
    ]
];
?>
```

#### 3. Kinde SDK Wrapper Class

```php
<?php
// KindeSdkAuth.php
require_once 'vendor/autoload.php';

use Kinde\KindeSDK\KindeClientSDK;
use Kinde\KindeSDK\Configuration;
use Kinde\KindeSDK\Sdk\Enums\GrantType;
use Kinde\KindeSDK\Sdk\Enums\StorageEnums;

class KindeSdkAuth {
    private $kindeClient;
    private $config;

    public function __construct($config) {
        $this->config = $config['kinde'];

        // Initialize Kinde client
        $this->kindeClient = new KindeClientSDK(
            $this->config['domain'],
            $this->config['redirect_uri'],
            $this->config['client_id'],
            $this->config['client_secret'],
            GrantType::AUTHORIZATION_CODE,
            $this->config['logout_redirect_uri'],
            $this->config['scope']
        );
    }

    /**
     * Get authorization URL for login
     */
    public function getLoginUrl(array $options = []): string {
        $additionalParams = [];

        // Add prompt parameter for SSO behavior
        if (isset($options['prompt'])) {
            $additionalParams['prompt'] = $options['prompt'];
        }

        return $this->kindeClient->login($additionalParams);
    }

    /**
     * Get authorization URL for registration
     */
    public function getRegisterUrl(array $options = []): string {
        $additionalParams = [];

        if (isset($options['prompt'])) {
            $additionalParams['prompt'] = $options['prompt'];
        }

        return $this->kindeClient->register($additionalParams);
    }

    /**
     * Handle callback and exchange code for tokens
     */
    public function handleCallback(): array {
        try {
            // The SDK handles the callback automatically
            $this->kindeClient->getToken();

            // Get user information
            $user = $this->kindeClient->getUser();

            return [
                'success' => true,
                'user' => $user,
                'access_token' => $this->kindeClient->getToken(),
                'is_authenticated' => $this->kindeClient->isAuthenticated()
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Get logout URL
     */
    public function getLogoutUrl(): string {
        return $this->kindeClient->logout();
    }

    /**
     * Check if user is authenticated
     */
    public function isAuthenticated(): bool {
        return $this->kindeClient->isAuthenticated();
    }

    /**
     * Get current user
     */
    public function getUser(): ?array {
        if (!$this->isAuthenticated()) {
            return null;
        }

        return $this->kindeClient->getUser();
    }

    /**
     * Get user permissions
     */
    public function getUserPermissions(): array {
        if (!$this->isAuthenticated()) {
            return [];
        }

        return $this->kindeClient->getPermissions();
    }

    /**
     * Get user organizations
     */
    public function getUserOrganizations(): array {
        if (!$this->isAuthenticated()) {
            return [];
        }

        return $this->kindeClient->getUserOrganizations();
    }

    /**
     * Get claim value
     */
    public function getClaim(string $claim): mixed {
        if (!$this->isAuthenticated()) {
            return null;
        }

        return $this->kindeClient->getClaim($claim);
    }
}
?>
```

#### 4. Usage Examples with SDK

```php
<?php
// login.php
session_start();
require_once 'config.php';
require_once 'KindeSdkAuth.php';

$config = include 'config.php';
$kindeAuth = new KindeSdkAuth($config);

// Redirect to Kinde for authentication
$authUrl = $kindeAuth->getLoginUrl([
    'prompt' => 'none' // For SSO behavior
]);

header('Location: ' . $authUrl);
exit;
?>
```

```php
<?php
// register.php
session_start();
require_once 'config.php';
require_once 'KindeSdkAuth.php';

$config = include 'config.php';
$kindeAuth = new KindeSdkAuth($config);

// Redirect to Kinde for registration
$authUrl = $kindeAuth->getRegisterUrl();

header('Location: ' . $authUrl);
exit;
?>
```

```php
<?php
// auth/callback.php
session_start();
require_once '../config.php';
require_once '../KindeSdkAuth.php';

$config = include '../config.php';
$kindeAuth = new KindeSdkAuth($config);

try {
    $result = $kindeAuth->handleCallback();

    if ($result['success']) {
        // Store user info in session
        $_SESSION['user'] = $result['user'];
        $_SESSION['is_authenticated'] = $result['is_authenticated'];
        $_SESSION['access_token'] = $result['access_token'];

        // Redirect to dashboard or home page
        header('Location: /dashboard.php');
        exit;
    } else {
        throw new Exception($result['error']);
    }

} catch (Exception $e) {
    // Handle error
    error_log('OAuth callback error: ' . $e->getMessage());
    header('Location: /login.php?error=' . urlencode($e->getMessage()));
    exit;
}
?>
```

```php
<?php
// logout.php
session_start();
require_once 'config.php';
require_once 'KindeSdkAuth.php';

$config = include 'config.php';
$kindeAuth = new KindeSdkAuth($config);

// Clear session
session_destroy();

// Redirect to Kinde logout
$logoutUrl = $kindeAuth->getLogoutUrl();
header('Location: ' . $logoutUrl);
exit;
?>
```

#### 5. Enhanced Middleware with SDK Features

```php
<?php
// middleware/auth_sdk.php
require_once 'config.php';
require_once 'KindeSdkAuth.php';

function requireAuth() {
    session_start();

    $config = include 'config.php';
    $kindeAuth = new KindeSdkAuth($config);

    if (!$kindeAuth->isAuthenticated()) {
        header('Location: /login.php');
        exit;
    }

    return $kindeAuth->getUser();
}

function requirePermission(string $permission) {
    session_start();

    $config = include 'config.php';
    $kindeAuth = new KindeSdkAuth($config);

    if (!$kindeAuth->isAuthenticated()) {
        header('Location: /login.php');
        exit;
    }

    $permissions = $kindeAuth->getUserPermissions();

    if (!in_array($permission, $permissions)) {
        http_response_code(403);
        echo 'Access denied: insufficient permissions';
        exit;
    }

    return $kindeAuth->getUser();
}

// Usage examples:
// require_once 'middleware/auth_sdk.php';
// $user = requireAuth();
// $user = requirePermission('read:users');
?>
```

#### 6. Dashboard Example with SDK Features

```php
<?php
// dashboard.php
require_once 'middleware/auth_sdk.php';
require_once 'config.php';
require_once 'KindeSdkAuth.php';

$user = requireAuth();
$config = include 'config.php';
$kindeAuth = new KindeSdkAuth($config);

// Get additional user data
$permissions = $kindeAuth->getUserPermissions();
$organizations = $kindeAuth->getUserOrganizations();
$customClaim = $kindeAuth->getClaim('custom_claim_name');
?>

<!DOCTYPE html>
<html>
<head>
    <title>Dashboard</title>
</head>
<body>
    <h1>Welcome, <?php echo htmlspecialchars($user['given_name'] ?? 'User'); ?>!</h1>

    <h2>User Information</h2>
    <p>Email: <?php echo htmlspecialchars($user['email'] ?? 'N/A'); ?></p>
    <p>Name: <?php echo htmlspecialchars(($user['given_name'] ?? '') . ' ' . ($user['family_name'] ?? '')); ?></p>

    <h2>Permissions</h2>
    <ul>
        <?php foreach ($permissions as $permission): ?>
            <li><?php echo htmlspecialchars($permission); ?></li>
        <?php endforeach; ?>
    </ul>

    <h2>Organizations</h2>
    <ul>
        <?php foreach ($organizations as $org): ?>
            <li><?php echo htmlspecialchars($org['name'] ?? $org['code'] ?? 'Unknown'); ?></li>
        <?php endforeach; ?>
    </ul>

    <a href="/logout.php">Logout</a>
</body>
</html>
```

### Key Points for SSO Implementation

1. **Same Kinde Configuration**: All apps must use the same `KINDE_ISSUER_URL` and `KINDE_CLIENT_ID`
2. **Proper State Parameter**: Always generate and verify a secure state parameter (minimum 8 characters)
3. **Session Management**: Store tokens securely and implement proper session handling
4. **Error Handling**: Handle OAuth errors gracefully and provide user feedback
5. **Security**: Always verify the state parameter to prevent CSRF attacks
6. **SDK Benefits**: The official SDK handles token management, state verification, and provides additional features like permissions and organizations

## Using in production

1. Create a [production API key](https://docs.crossmint.com/introduction/platform/api-keys/client-side).`

The auth works as it's currently
