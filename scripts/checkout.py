#!/usr/bin/env python
from plumbum.cmd import git
import argparse

parser = argparse.ArgumentParser(description='Checkout branch in remote repository')
parser.add_argument('user', type=str, help='User that created pull request')
parser.add_argument('branch', type=str, help='Pull request branch')
args = parser.parse_args()

repo_addr = f'git@github.com:{args.user}/stock-engine-frontend'

def run_git(*args):
    return git.run(args, retcode = None)

run_git('remote', 'add', args.user, repo_addr)

retcode, out, err = run_git('fetch', f'{args.user}')

if retcode != 0:
    print(f'Unable to fetch from {args.user}\n{err}')
    run_git('remote', 'remove', args.user)
else:
    retcode, out, err = run_git('checkout', f'{args.user}/{args.branch}')
    if retcode == 0:
        print(f'You are now on {args.user}/{args.branch} branch')
    else:
        print(err)
