#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    NextTokenId,
    Eligible(Address),
    OwnerToToken(Address),
    TokenOwner(u64),
    TokenUri(u64),
}

#[contract]
pub struct AchievementsContract;

#[contractimpl]
impl AchievementsContract {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::NextTokenId, &1u64);
    }

    pub fn set_eligible(env: Env, admin: Address, member: Address, eligible: bool) {
        Self::require_admin(&env, &admin);
        env.storage()
            .persistent()
            .set(&DataKey::Eligible(member), &eligible);
    }

    pub fn claim_certificate(env: Env, member: Address, metadata_uri: String) -> u64 {
        member.require_auth();

        let is_eligible: bool = env
            .storage()
            .persistent()
            .get(&DataKey::Eligible(member.clone()))
            .unwrap_or(false);
        if !is_eligible {
            panic!("member not eligible");
        }
        if env
            .storage()
            .persistent()
            .has(&DataKey::OwnerToToken(member.clone()))
        {
            panic!("member already has certificate");
        }

        let token_id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::NextTokenId)
            .unwrap_or(1u64);
        env.storage()
            .instance()
            .set(&DataKey::NextTokenId, &(token_id + 1));

        env.storage()
            .persistent()
            .set(&DataKey::OwnerToToken(member.clone()), &token_id);
        env.storage()
            .persistent()
            .set(&DataKey::TokenOwner(token_id), &member);
        env.storage()
            .persistent()
            .set(&DataKey::TokenUri(token_id), &metadata_uri);

        token_id
    }

    pub fn token_of(env: Env, member: Address) -> Option<u64> {
        env.storage()
            .persistent()
            .get(&DataKey::OwnerToToken(member))
    }

    pub fn token_uri(env: Env, token_id: u64) -> String {
        env.storage()
            .persistent()
            .get(&DataKey::TokenUri(token_id))
            .unwrap_or_else(|| panic!("token not found"))
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
