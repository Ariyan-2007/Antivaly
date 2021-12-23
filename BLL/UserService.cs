using AutoMapper;
using BEL;
using DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL
{
    public class UserService
    {
        static UserService()
        {
            Mapper.Initialize(cfg =>
            {
                cfg.CreateMap<Buyer, BuyerModel>();
                cfg.CreateMap<BuyerModel, Buyer>();
                cfg.CreateMap<Category, CategoryModel>();
                cfg.CreateMap<CategoryModel, Category>();
                cfg.CreateMap<Coupon, CouponModel>();
                cfg.CreateMap<CouponModel, Coupon>();
                cfg.CreateMap<Token, TokenModel>();
                cfg.CreateMap<TokenModel, Token>();
                cfg.CreateMap<User, UserModel>();
                cfg.CreateMap<UserModel, User>();
                cfg.CreateMap<UserID, UserIdModel>();
                cfg.CreateMap<UserIdModel, UserID>();
                cfg.CreateMap<Delivery, DeliveryModel>();
                cfg.CreateMap<DeliveryModel, Delivery>();
                cfg.CreateMap<Transaction, TransactionModel>();
                cfg.CreateMap<TransactionModel, Transaction>();
                cfg.CreateMap<Product, ProductModel>();
                cfg.CreateMap<ProductModel, Product>();
            });
        }

        public static bool Registration(UserModel user)
        {
            var data = Mapper.Map<User>(user);
            UserIdService.Increment(data);
            DataSupplier.UserDataAccess().Add(data);
            return true;
        }


        public static bool Edit(UserModel b)
        {
            var data = Mapper.Map<User>(b);
            DataSupplier.UserDataAccess().Edit(data);
            return true;
        }

        public static bool Change(string uid, string AccStatus)
        {
            var data = Get(uid);
            var dmData = DeliveryService.Get(uid);  
            if(AccStatus == "Blocked")
            {
                if (data.AccType == "Delivery Man")
                {
                    data.AccStatus = "Blocked";
                    dmData.Status = "Blocked";
                    DataSupplier.DeliveryDataAccess().Edit(Mapper.Map<Delivery>(dmData));
                }
                else
                { data.AccStatus = "Blocked"; }
                
            }
            else if(AccStatus == "Active")
            {
                if(data.AccType == "Delivery Man" && data.AccStatus == "Pending")
                {
                    data.AccStatus = "Active";
                    var delivery = new Delivery();
                    delivery.UID = data.UID;
                    delivery.Status = "Free";
                    delivery.NumOfOrders = 0;
                    delivery.DeliveryCharge = 20;
                    delivery.LevelCode = 1;
                    delivery.Balance = 0;
                    DataSupplier.DeliveryDataAccess().Add(delivery);
                }
                else if(data.AccType == "Delivery Man" && data.AccStatus == "Blocked")
                {
                    data.AccStatus = "Active";
                    dmData.Status = "Free";
                    DataSupplier.DeliveryDataAccess().Edit(Mapper.Map<Delivery>(dmData));
                }
                else
                { data.AccStatus = "Active"; }
                
            }
            DataSupplier.UserDataAccess().Edit(Mapper.Map<User>(data));
            return true;
        }

        public static void Delete(string id)
        {
            DataSupplier.UserDataAccess().Delete(id);
        }

        public static List<UserModel> Get()
        {
            var data = Mapper.Map<List<UserModel>>(DataSupplier.UserDataAccess().Get());
            return data;
        }
        public static UserModel Get(string id)
        {
            var data = Mapper.Map<UserModel>(DataSupplier.UserDataAccess().Get(id));
            return data;
        }
    }
}
