import pymongo
import time
import random

conn = pymongo.Connection()
db = conn.laundrymon

doc_keys = ['3LW', '3RW', '3LD', '3RD', '2LW', '2RW', '2LD', '2RD']

def add_record(t=None):
    doc = dict((k, random.randint(0,1)) for k in doc_keys)
    doc['timestamp'] = time.time() if t is None else t
    db.states.insert(doc)
    return doc

def main():
    db.states.remove()
    t = time.time()
    for i in range(1, 50):
        add_record(t - 10 * i)
    while True:
        doc = add_record()
        print doc
        time.sleep(10)

if __name__ == '__main__':
    main()