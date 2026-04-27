#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    Balance,
    Contribution(Address),
}

#[contract]
pub struct TreasuryContract;

#[contractimpl]
impl TreasuryContract {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::Balance, &0i128);
    }

    pub fn contribute(env: Env, from: Address, amount: i128) {
        from.require_auth();
        if amount <= 0 {
            panic!("amount must be positive");
        }

        let current = Self::contribution_of(env.clone(), from.clone());
        env.storage()
            .persistent()
            .set(&DataKey::Contribution(from), &(current + amount));

        let balance = Self::balance(env.clone());
        env.storage().instance().set(&DataKey::Balance, &(balance + amount));
    }

    pub fn allocate(env: Env, admin: Address, recipient: Address, amount: i128) {
        Self::require_admin(&env, &admin);
        if amount <= 0 {
            panic!("amount must be positive");
        }

        let balance = Self::balance(env.clone());
        if amount > balance {
            panic!("insufficient treasury balance");
        }

        // Accounting-only split/distribution tracking for MVP.
        let current = Self::contribution_of(env.clone(), recipient.clone());
        env.storage()
            .persistent()
            .set(&DataKey::Contribution(recipient), &(current + amount));
        env.storage().instance().set(&DataKey::Balance, &(balance - amount));
    }

    pub fn balance(env: Env) -> i128 {
        env.storage().instance().get(&DataKey::Balance).unwrap_or(0i128)
    }

    pub fn contribution_of(env: Env, account: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::Contribution(account))
            .unwrap_or(0i128)
    }

    fn require_admin(env: &Env, admin: &Address) {
        admin.require_auth();
        let stored_admin: Address = env
            .storage()
            .instance()
            .get(&DataKey::Admin)
            .unwrap_or_else(|| panic!("not initialized"));
        if stored_admin != *admin {
            panic!("only admin");
        }
    }
}
