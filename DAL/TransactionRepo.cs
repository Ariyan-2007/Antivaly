using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

namespace DAL
{
    public class TransactionRepo: ITransactionRepository<Transaction, int>
    {
        AntivalyEntities db;

        public TransactionRepo(AntivalyEntities db)
        {
            this.db = db;
        }

        public void Add(Transaction e)
        {
            this.db.Transactions.Add(e);
            this.db.SaveChanges();
        }

        public void Delete(int id)
        {
            var transaction = db.Transactions.FirstOrDefault(c => c.TID == id);
            db.Transactions.Remove(transaction);
            db.SaveChanges();
        }

        public void Edit(Transaction e)
        {
            var t = db.Transactions.FirstOrDefault(en => en.TID == e.TID);
            db.Entry(t).CurrentValues.SetValues(e);
            db.SaveChanges();
        }

        public List<Transaction> Get()
        {
            return db.Transactions.ToList();
        }

        public Transaction Get(int id)
        {
            return db.Transactions.FirstOrDefault(c => c.TID == id);
        }

        public void PlaceOrder(string list, string id)
        {

            var d = new List<Product>();
            d = new JavaScriptSerializer().Deserialize<List<Product>>(list);

            foreach (var c in d)
            {
                var data = db.Products.FirstOrDefault(e => e.PID == c.PID);
                var cp = data;
                cp.Qty -= c.Qty;
                db.Entry(data).CurrentValues.SetValues(cp);
                db.SaveChanges();
            }

            var transaction = new Transaction()
            {
                UID = id,
                TAmount = d.Select(i => i.Price).Sum(),
                TDetials = list,
                Status = "In Processing",
                TDate = DateTime.Now.ToString()
            };

            db.Transactions.Add(transaction);
            db.SaveChanges();
        }

        public bool CancelOrder(int id)
        {
            var d = db.Transactions.FirstOrDefault(e => e.TID == id);

            var temp = Convert.ToDateTime(d.TDate);

            if (temp.AddDays(1) < DateTime.Now)
            {
                var cp = d;
                cp.Status = "Canceled";

                var p = new List<Product>();
                p = new JavaScriptSerializer().Deserialize<List<Product>>(cp.TDetials);

                foreach(var i in p)
                {
                    var data = db.Products.FirstOrDefault(e => e.PID == i.PID);
                    var c = data;
                    c.Qty += i.Qty;
                    db.Entry(data).CurrentValues.SetValues(c);
                    db.SaveChanges();
                }

                db.Entry(d).CurrentValues.SetValues(cp);
                db.SaveChanges();
                return true;
            }
            return false;
        }
    }
}
