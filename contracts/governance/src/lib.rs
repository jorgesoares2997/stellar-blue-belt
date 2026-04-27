#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, Vec};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    PollCount,
    Poll(u32),
    Vote(u32, Address),
}

#[derive(Clone)]
#[contracttype]
pub struct Poll {
    pub question: String,
    pub options: Vec<String>,
    pub votes: Vec<u32>,
    pub deadline_ledger: u32,
}

#[contract]
pub struct GovernanceContract;

#[contractimpl]
impl GovernanceContract {
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("already initialized");
        }
        admin.require_auth();
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::PollCount, &0u32);
    }

    pub fn create_poll(
        env: Env,
        admin: Address,
        question: String,
        options: Vec<String>,
        deadline_ledger: u32,
    ) -> u32 {
        Self::require_admin(&env, &admin);
        if options.len() < 2 {
            panic!("need at least 2 options");
        }
        if deadline_ledger <= env.ledger().sequence() {
            panic!("deadline must be in future");
        }

        let mut votes = Vec::<u32>::new(&env);
        let mut i: u32 = 0;
        while i < options.len() {
            votes.push_back(0u32);
            i += 1;
        }

        let mut poll_count: u32 = env
            .storage()
            .instance()
            .get(&DataKey::PollCount)
            .unwrap_or(0u32);
        poll_count += 1;
        let poll_id = poll_count;

        let poll = Poll {
            question,
            options,
            votes,
            deadline_ledger,
        };

        env.storage().persistent().set(&DataKey::Poll(poll_id), &poll);
        env.storage().instance().set(&DataKey::PollCount, &poll_count);
        poll_id
    }

    pub fn vote(env: Env, voter: Address, poll_id: u32, option_index: u32) {
        voter.require_auth();
        let vote_key = DataKey::Vote(poll_id, voter.clone());
        if env.storage().persistent().has(&vote_key) {
            panic!("voter already voted");
        }

        let poll_key = DataKey::Poll(poll_id);
        let mut poll: Poll = env
            .storage()
            .persistent()
            .get(&poll_key)
            .unwrap_or_else(|| panic!("poll not found"));

        if env.ledger().sequence() > poll.deadline_ledger {
            panic!("poll already closed");
        }
        if option_index >= poll.options.len() {
            panic!("invalid option index");
        }

        let current_votes = poll.votes.get(option_index).unwrap_or(0u32);
        poll.votes.set(option_index, current_votes + 1);

        env.storage().persistent().set(&poll_key, &poll);
        env.storage().persistent().set(&vote_key, &true);
    }

    pub fn get_poll(env: Env, poll_id: u32) -> Poll {
        env.storage()
            .persistent()
            .get(&DataKey::Poll(poll_id))
            .unwrap_or_else(|| panic!("poll not found"))
    }

    pub fn poll_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::PollCount).unwrap_or(0u32)
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
